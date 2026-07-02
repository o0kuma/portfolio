export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { ensureBudgetTable, setSimulationRunning, isSimulationRunning, getDailyBudgetCents, getTodaySpendCents } from '@/lib/aetheria/budget'
import { ensureAgentTables } from '@/lib/aetheria/engine'

const PostSchema = z.object({
  running: z.boolean().optional(),
  dailyBudgetCents: z.number().int().min(10).max(5000).optional(),
})

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }
  await ensureBudgetTable()
  const [running, budget, spent] = await Promise.all([
    isSimulationRunning(),
    getDailyBudgetCents(),
    getTodaySpendCents(),
  ])
  return NextResponse.json({ success: true, running, dailyBudgetCents: budget, spentCentsToday: spent })
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    await ensureBudgetTable()
    await ensureAgentTables()

    const body = await request.json()
    const parsed = PostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 })
    }

    if (typeof parsed.data.running === 'boolean') {
      await setSimulationRunning(parsed.data.running)
    }
    if (typeof parsed.data.dailyBudgetCents === 'number') {
      await dbQuery(
        `INSERT INTO aetheria_config (key, value) VALUES ('daily_budget_cents', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1`,
        [String(parsed.data.dailyBudgetCents)],
      )
    }

    revalidateTag('aetheria-state')
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/aetheria/admin POST]', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
