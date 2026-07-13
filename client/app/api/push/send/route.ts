import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL

  if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
  }

  webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey)

  try {
    const { title, body, url } = await req.json() as {
      title: string
      body: string
      url?: string
    }

    const result = await dbQuery<{ endpoint: string; p256dh: string; auth: string }>(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions'
    )

    const payload = JSON.stringify({ title, body, url: url ?? '/' })
    const results = await Promise.allSettled(
      result.rows.map(row =>
        webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          payload
        ).catch(err => {
          throw Object.assign(err, { endpoint: row.endpoint })
        })
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length

    // Gone/expired subscriptions (404/410) never become valid again — prune
    // them so they stop accumulating and being retried on every send.
    const staleEndpoints = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason)
      .filter(err => err?.statusCode === 404 || err?.statusCode === 410)
      .map(err => err.endpoint)

    if (staleEndpoints.length > 0) {
      await dbQuery('DELETE FROM push_subscriptions WHERE endpoint = ANY($1)', [staleEndpoints])
    }

    const failed = results.length - sent

    return NextResponse.json({ success: true, sent, failed, pruned: staleEndpoints.length })
  } catch (error) {
    console.error('Push send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
