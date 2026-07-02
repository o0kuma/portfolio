export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { runTickBatch } from '@/lib/aetheria/engine'
import { ensureBudgetTable, hasBudgetRemaining } from '@/lib/aetheria/budget'

// 관리자가 크론을 기다리지 않고 즉시 1틱을 테스트 실행할 수 있는 엔드포인트.
// 예산 체크는 그대로 적용되어 무제한 남용은 막는다.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    await ensureBudgetTable()
    const withinBudget = await hasBudgetRemaining()
    if (!withinBudget) {
      return NextResponse.json({ success: false, error: '오늘 예산을 모두 사용했습니다.' }, { status: 400 })
    }

    const result = await runTickBatch()
    revalidateTag('aetheria-state')
    revalidateTag('aetheria-log')
    return NextResponse.json({ success: true, ...result })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/aetheria/admin/run-tick]', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
