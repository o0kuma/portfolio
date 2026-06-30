export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { dbQuery } from '@/lib/neon-server'

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
}

async function ensureTable() {
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS lotto_draw_history (
      draw_no INT PRIMARY KEY,
      n1 INT, n2 INT, n3 INT, n4 INT, n5 INT, n6 INT,
      bonus INT,
      draw_date DATE
    )
  `)
}

async function fetchDraw(no: number): Promise<DhLottoResponse | null> {
  try {
    const res = await fetch(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${no}`,
      { signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) return null
    const data = (await res.json()) as DhLottoResponse
    if (data.returnValue !== 'success') return null
    return data
  } catch {
    return null
  }
}

// POST /api/lotto/sync — 동행복권에서 빠진 회차를 DB에 적재.
// 한 번 호출에 최대 limit개씩 처리 (전체 백필은 여러 번 호출).
export async function POST(request: NextRequest) {
  try {
    await ensureTable()

    const body = await request.json().catch(() => ({}))
    const limit = Math.min(Math.max(Number(body?.limit) || 60, 1), 200)

    // 이미 가진 최대 회차 다음부터 채움
    const maxRes = await dbQuery<{ max: number | null }>(
      `SELECT MAX(draw_no) AS max FROM lotto_draw_history`,
    )
    let next = (Number(maxRes.rows[0]?.max ?? 0) || 0) + 1

    let inserted = 0
    let firstFail: number | null = null

    for (let i = 0; i < limit; i++) {
      const draw = await fetchDraw(next)
      if (!draw) {
        // 존재하지 않는(미래) 회차 → 백필 종료
        firstFail = next
        break
      }
      await dbQuery(
        `INSERT INTO lotto_draw_history (draw_no, n1, n2, n3, n4, n5, n6, bonus, draw_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (draw_no) DO NOTHING`,
        [
          draw.drwNo,
          draw.drwtNo1, draw.drwtNo2, draw.drwtNo3, draw.drwtNo4, draw.drwtNo5, draw.drwtNo6,
          draw.bnusNo, draw.drwNoDate || null,
        ],
      )
      inserted++
      next++
    }

    revalidateTag('lotto-stats')

    return NextResponse.json({
      ok: true,
      inserted,
      nextDrawNo: next,
      stopped: firstFail !== null,
      message:
        inserted === 0
          ? '새로 추가된 회차가 없습니다. (외부 API 접근이 막혀 있거나 이미 최신 상태)'
          : `${inserted}개 회차를 적재했습니다. ${firstFail ? '(최신까지 완료)' : '더 남았으면 다시 호출하세요.'}`,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/lotto/sync POST]', msg)
    return NextResponse.json({ ok: false, message: msg }, { status: 500 })
  }
}
