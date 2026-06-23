export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

// Simple in-memory IP rate limit: max 3 posts per hour per IP
const ipPostLog = new Map<string, number[]>()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const timestamps = (ipPostLog.get(ip) ?? []).filter((t) => t > windowStart)
  if (timestamps.length >= RATE_LIMIT_MAX) return true
  timestamps.push(now)
  ipPostLog.set(ip, timestamps)
  return false
}

export async function GET() {
  await dbQuery(`CREATE TABLE IF NOT EXISTS guestbook (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    message VARCHAR(200) NOT NULL,
    emoji VARCHAR(10) DEFAULT '👋',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`)
  const r = await dbQuery('SELECT * FROM guestbook ORDER BY created_at DESC LIMIT 50')
  return NextResponse.json({ entries: r.rows })
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  let body: { name?: string; message?: string; emoji?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const name = (body.name ?? '').trim()
  const message = (body.message ?? '').trim()
  const emoji = (body.emoji ?? '👋').trim()

  if (!name || name.length > 50) {
    return NextResponse.json({ error: '이름은 1~50자여야 합니다.' }, { status: 400 })
  }
  if (!message || message.length > 200) {
    return NextResponse.json({ error: '메시지는 1~200자여야 합니다.' }, { status: 400 })
  }

  const r = await dbQuery(
    'INSERT INTO guestbook (name, message, emoji) VALUES ($1, $2, $3) RETURNING *',
    [name, message, emoji]
  )
  return NextResponse.json({ entry: r.rows[0] }, { status: 201 })
}
