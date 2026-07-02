export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { runTickBatch } from '@/lib/aetheria/engine'
import { ensureBudgetTable, isSimulationRunning, hasBudgetRemaining } from '@/lib/aetheria/budget'

// 크론 전용 진입점 — 방문자 요청으로는 절대 호출되지 않는다 (CRON_SECRET 필수).
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureBudgetTable()

    const running = await isSimulationRunning()
    if (!running) {
      return NextResponse.json({ ok: true, skipped: 'simulation is paused' })
    }

    const withinBudget = await hasBudgetRemaining()
    if (!withinBudget) {
      return NextResponse.json({ ok: true, skipped: 'daily budget exhausted' })
    }

    const result = await runTickBatch()
    return NextResponse.json({ ok: true, ...result })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/cron/aetheria-tick]', msg)
    return NextResponse.json({ ok: false, message: msg }, { status: 500 })
  }
}
