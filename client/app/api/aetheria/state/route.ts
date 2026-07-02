export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { dbQuery } from '@/lib/neon-server'
import { ensureAgentTables } from '@/lib/aetheria/engine'
import { isSimulationRunning, getTodaySpendCents, getDailyBudgetCents } from '@/lib/aetheria/budget'
import { isAdminAuthorized } from '@/lib/adminAuth'

// 크론이 하루 1회만 데이터를 바꾸므로, 방문자 폴링은 20초 캐시로 묶어 Neon 컴퓨트 사용량을 절약한다.
const fetchState = unstable_cache(
  async () => {
    await ensureAgentTables()

    const agentsRes = await dbQuery(
      `SELECT id, model, name, role, gold, stamina, x, y, status, last_action, updated_at
       FROM aetheria_agents ORDER BY id`,
    )
    const running = await isSimulationRunning()
    const [spent, budget] = await Promise.all([getTodaySpendCents(), getDailyBudgetCents()])

    return {
      agents: agentsRes.rows,
      running,
      budget: { spentCents: spent, capCents: budget },
    }
  },
  ['aetheria-state'],
  { revalidate: 20, tags: ['aetheria-state'] },
)

// 관리자 전용 — 비용 관리를 위해 공개하지 않는다. LLM 호출은 절대 발생하지 않는다.
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ agents: [], running: false, budget: null, message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const data = await fetchState()
    return NextResponse.json(data)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/aetheria/state GET]', msg)
    return NextResponse.json({ agents: [], running: false, budget: null, message: msg }, { status: 200 })
  }
}
