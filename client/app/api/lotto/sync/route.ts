export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { runSync, clampLimit } from '@/lib/lotto/sync'

// 브라우저에서 주소만 열면 실행되도록 GET도 지원.
// 예: /api/lotto/sync?limit=200  → 200개씩. 전체(1100+) 채우려면 몇 번 새로고침.
export async function GET(request: NextRequest) {
  try {
    const result = await runSync(clampLimit(request.nextUrl.searchParams.get('limit')))
    revalidateTag('lotto-stats')
    return NextResponse.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/lotto/sync GET]', msg)
    return NextResponse.json({ ok: false, message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const result = await runSync(clampLimit(body?.limit))
    revalidateTag('lotto-stats')
    return NextResponse.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/lotto/sync POST]', msg)
    return NextResponse.json({ ok: false, message: msg }, { status: 500 })
  }
}
