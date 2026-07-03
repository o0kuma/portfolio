export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { ensureAgentTables } from '@/lib/aetheria/engine'
import { isAdminAuthorized } from '@/lib/adminAuth'

interface ModelStat {
  model: string
  alive: number
  dead: number
  avgGold: number
  avgStamina: number
  totalGold: number
  huntCount: number
  huntGoldEarned: number
  tradeCount: number
  partyCount: number
  deathCount: number
}

// 원래 설계문서의 핵심 질문 — "어떤 지능이 생태계를 지배하는가?" 에 답하는 통계.
// 관리자 전용, LLM 호출 없음(순수 집계 쿼리).
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ stats: [] }, { status: 401 })
  }

  try {
    await ensureAgentTables()

    const agentsRes = await dbQuery<{
      model: string; status: string; gold: number; stamina: number
    }>(`SELECT model, status, gold, stamina FROM aetheria_agents`)

    const eventsRes = await dbQuery<{
      model: string; event_type: string; count: string; hunt_gold: string
    }>(`
      SELECT
        a.model,
        e.event_type,
        COUNT(*)::text AS count,
        COALESCE(SUM((e.payload->>'huntGold')::int), 0)::text AS hunt_gold
      FROM aetheria_events e
      JOIN aetheria_agents a ON a.id = e.agent_id
      GROUP BY a.model, e.event_type
    `)

    const models: string[] = Array.from(new Set(agentsRes.rows.map((r) => r.model)))
    const stats: ModelStat[] = models.map((model) => {
      const agents = agentsRes.rows.filter((r) => r.model === model)
      const alive = agents.filter((a) => a.status === 'alive')
      const dead = agents.filter((a) => a.status !== 'alive')
      const events = eventsRes.rows.filter((r) => r.model === model)

      const findCount = (type: string) => Number(events.find((e) => e.event_type === type)?.count ?? 0)
      const huntGoldEarned = events
        .filter((e) => e.event_type === 'hunt')
        .reduce((sum, e) => sum + Number(e.hunt_gold), 0)

      return {
        model,
        alive: alive.length,
        dead: dead.length,
        avgGold: alive.length ? Math.round(alive.reduce((s, a) => s + a.gold, 0) / alive.length) : 0,
        avgStamina: alive.length ? Math.round(alive.reduce((s, a) => s + a.stamina, 0) / alive.length) : 0,
        totalGold: agents.reduce((s, a) => s + a.gold, 0),
        huntCount: findCount('hunt'),
        huntGoldEarned,
        tradeCount: findCount('trade_offer'),
        partyCount: findCount('party_invite'),
        deathCount: findCount('death'),
      }
    })

    return NextResponse.json({ stats })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/aetheria/stats GET]', msg)
    return NextResponse.json({ stats: [], message: msg }, { status: 200 })
  }
}
