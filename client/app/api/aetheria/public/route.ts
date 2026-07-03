export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { dbQuery } from '@/lib/neon-server'
import { ensureAgentTables } from '@/lib/aetheria/engine'

// 공개(비인증) 전용 — 위치/이름/모델/골드/체력/상태 등 안전한 필드만 노출.
// 예산·환경변수 진단 등 민감 정보는 절대 포함하지 않는다. LLM 호출은 발생하지 않는다.
// RPG 페이지(/rpg)가 이 데이터를 읽어 에이전트를 마을을 돌아다니는 NPC로 표시한다.
const fetchPublicState = unstable_cache(
  async () => {
    await ensureAgentTables()

    const agentsRes = await dbQuery(
      `SELECT id, model, name, role, gold, stamina, x, y, status, last_action
       FROM aetheria_agents ORDER BY id`,
    )
    const eventsRes = await dbQuery(
      `SELECT e.agent_id, COALESCE(a.name, '시스템') AS agent_name, COALESCE(a.model, 'gpt') AS model, e.event_type, e.display_text, e.created_at
       FROM aetheria_events e
       LEFT JOIN aetheria_agents a ON a.id = e.agent_id
       ORDER BY e.created_at DESC
       LIMIT 12`,
    )
    const tickRes = await dbQuery<{ last_tick_id: number; season: number }>(
      `SELECT last_tick_id, season FROM aetheria_tick_state WHERE id = 1`,
    )
    // 명예의 전당 — 최장수 / 최고부자 각 상위 5
    const longestRes = await dbQuery(
      `SELECT name, model, role, season, survived_days, final_gold
       FROM aetheria_hall_of_fame ORDER BY survived_days DESC, final_gold DESC LIMIT 5`,
    )
    const richestRes = await dbQuery(
      `SELECT name, model, role, season, survived_days, final_gold
       FROM aetheria_hall_of_fame ORDER BY final_gold DESC, survived_days DESC LIMIT 5`,
    )

    return {
      agents: agentsRes.rows,
      recentEvents: eventsRes.rows,
      currentTick: tickRes.rows[0]?.last_tick_id ?? 0,
      season: tickRes.rows[0]?.season ?? 1,
      hallOfFame: { longest: longestRes.rows, richest: richestRes.rows },
    }
  },
  ['aetheria-public-state'],
  { revalidate: 30, tags: ['aetheria-state'] },
)

export async function GET() {
  try {
    const data = await fetchPublicState()
    return NextResponse.json(data)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/aetheria/public GET]', msg)
    return NextResponse.json({ agents: [], recentEvents: [], currentTick: 0 }, { status: 200 })
  }
}
