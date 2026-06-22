import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint, keys } = body as {
      endpoint: string
      keys: { p256dh: string; auth: string }
    }

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    await dbQuery(
      `CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE,
        p256dh TEXT,
        auth TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    )

    await dbQuery(
      `INSERT INTO push_subscriptions (endpoint, p256dh, auth)
       VALUES ($1, $2, $3)
       ON CONFLICT (endpoint) DO UPDATE SET p256dh = $2, auth = $3`,
      [endpoint, keys.p256dh, keys.auth]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
