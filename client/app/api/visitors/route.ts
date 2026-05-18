export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

// POST: register session as a visitor (idempotent — duplicate session_id is silently ignored)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId: string = body?.session_id

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return NextResponse.json({ message: 'session_id가 필요합니다.' }, { status: 400 })
    }

    await dbQuery(
      `INSERT INTO visitor_count (session_id)
       VALUES ($1)
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId.trim()],
    )

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/visitors POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

// GET: total cumulative unique visitor count
export async function GET() {
  try {
    const result = await dbQuery<{ count: string }>(
      `SELECT COUNT(*) AS count FROM visitor_count`,
    )

    const count = Number(result.rows[0]?.count ?? 0)
    return NextResponse.json({ count })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/visitors GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
