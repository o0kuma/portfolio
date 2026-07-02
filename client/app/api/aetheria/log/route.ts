export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { dbQuery } from '@/lib/neon-server'
import { ensureAgentTables } from '@/lib/aetheria/engine'

const GetSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
})

// 방문자용 — 모더레이션을 이미 통과해 저장된 display_text만 노출. LLM 호출 없음.
export async function GET(request: NextRequest) {
  try {
    await ensureAgentTables()
    const parsed = GetSchema.safeParse({ limit: request.nextUrl.searchParams.get('limit') ?? undefined })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const res = await dbQuery(
      `SELECT e.tick_id, e.agent_id, a.name AS agent_name, a.model, e.event_type, e.display_text, e.created_at
       FROM aetheria_events e
       JOIN aetheria_agents a ON a.id = e.agent_id
       ORDER BY e.created_at DESC
       LIMIT $1`,
      [parsed.data.limit],
    )

    return NextResponse.json({ events: res.rows })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/aetheria/log GET]', msg)
    return NextResponse.json({ events: [], message: msg }, { status: 200 })
  }
}
