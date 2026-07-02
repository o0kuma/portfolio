export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { z } from 'zod'
import { dbQuery } from '@/lib/neon-server'
import { ensureAgentTables } from '@/lib/aetheria/engine'
import { isAdminAuthorized } from '@/lib/adminAuth'

const GetSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
})

// 크론이 하루 1회만 새 이벤트를 쓰므로, 방문자 폴링은 20초 캐시로 묶는다.
const fetchLog = unstable_cache(
  async (limit: number) => {
    await ensureAgentTables()
    const res = await dbQuery(
      `SELECT e.tick_id, e.agent_id, a.name AS agent_name, a.model, e.event_type, e.display_text, e.created_at
       FROM aetheria_events e
       JOIN aetheria_agents a ON a.id = e.agent_id
       ORDER BY e.created_at DESC
       LIMIT $1`,
      [limit],
    )
    return res.rows
  },
  ['aetheria-log'],
  { revalidate: 20, tags: ['aetheria-log'] },
)

// 관리자 전용 — LLM 호출은 없지만 비공개로 유지한다.
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ events: [], message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const parsed = GetSchema.safeParse({ limit: request.nextUrl.searchParams.get('limit') ?? undefined })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const events = await fetchLog(parsed.data.limit)
    return NextResponse.json({ events })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/aetheria/log GET]', msg)
    return NextResponse.json({ events: [], message: msg }, { status: 200 })
  }
}
