export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

interface DhLottoResponse {
  returnValue: string
  drwNo: number
  drwNoDate: string
  drwtNo1: number
  drwtNo2: number
  drwtNo3: number
  drwtNo4: number
  drwtNo5: number
  drwtNo6: number
  bnusNo: number
  firstWinamnt: number
  firstPrzwnerCo: number
}

// GET /api/lotto/history?drwNo=1100 — 특정 회차의 실제 당첨번호 조회 (프록시)
export async function GET(request: NextRequest) {
  const drwNo = request.nextUrl.searchParams.get('drwNo')
  if (!drwNo || !/^\d{1,4}$/.test(drwNo)) {
    return NextResponse.json({ message: 'drwNo가 필요합니다.' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`,
      { signal: AbortSignal.timeout(4000) },
    )
    if (!res.ok) {
      return NextResponse.json({ message: '조회 실패' }, { status: 502 })
    }
    const data = (await res.json()) as DhLottoResponse
    if (data.returnValue !== 'success') {
      return NextResponse.json({ message: '존재하지 않는 회차입니다.' }, { status: 404 })
    }
    return NextResponse.json({
      drawNo: data.drwNo,
      date: data.drwNoDate,
      drawn: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6],
      bonus: data.bnusNo,
      firstPrize: data.firstWinamnt,
      firstWinners: data.firstPrzwnerCo,
    })
  } catch {
    return NextResponse.json({ message: '회차 정보를 불러오지 못했습니다.' }, { status: 502 })
  }
}
