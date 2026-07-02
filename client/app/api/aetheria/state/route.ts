export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { ensureAgentTables } from '@/lib/aetheria/engine'
import { isSimulationRunning, getTodaySpendCents, getDailyBudgetCents } from '@/lib/aetheria/budget'

// 방문자용 — DB 조회만 수행, LLM 호출은 절대 발생하지 않는다.
export async function GET() {
  try {
    await ensureAgentTables()

    const agentsRes = await dbQuery(
      `SELECT id, model, name, role, gold, x, y, status, last_action, updated_at
       FROM aetheria_agents ORDER BY id`,
    )
    const running = await isSimulationRunning()
    const [spent, budget] = await Promise.all([getTodaySpendCents(), getDailyBudgetCents()])

    return NextResponse.json({
      agents: agentsRes.rows,
      running,
      budget: { spentCents: spent, capCents: budget },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/aetheria/state GET]', msg)
    return NextResponse.json({ agents: [], running: false, budget: null, message: msg }, { status: 200 })
  }
}
