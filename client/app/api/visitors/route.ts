export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

// POST: session_id heartbeat - upsert last_seen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId: string = body?.session_id

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return NextResponse.json({ message: 'session_id가 필요합니다.' }, { status: 400 })
    }

    await dbQuery(
      `INSERT INTO visitor_sessions (session_id, last_seen)
       VALUES ($1, NOW())
       ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW()`,
      [sessionId.trim()],
    )

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/visitors POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

// GET: 최근 30초 이내 활성 세션 수 반환
export async function GET() {
  try {
    const result = await dbQuery<{ count: string }>(
      `SELECT COUNT(*)::int AS count
       FROM visitor_sessions
       WHERE last_seen > NOW() - INTERVAL '30 seconds'`,
    )

    const count = Number(result.rows[0]?.count ?? 0)
    return NextResponse.json({ count })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/visitors GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
