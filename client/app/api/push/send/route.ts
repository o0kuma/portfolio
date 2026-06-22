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
        )
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({ success: true, sent, failed })
  } catch (error) {
    console.error('Push send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
