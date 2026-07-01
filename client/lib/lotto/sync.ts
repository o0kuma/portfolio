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

export async function ensureHistoryTable() {
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

export interface SyncResult {
  ok: boolean
  inserted: number
  nextDrawNo: number
  stopped: boolean
  message: string
}

// 동행복권에서 빠진 회차를 DB에 적재. 한 번에 최대 limit개.
export async function runSync(limit: number): Promise<SyncResult> {
  await ensureHistoryTable()

  const maxRes = await dbQuery<{ max: number | null }>(
    `SELECT MAX(draw_no) AS max FROM lotto_draw_history`,
  )
  let next = (Number(maxRes.rows[0]?.max ?? 0) || 0) + 1

  let inserted = 0
  let firstFail: number | null = null

  for (let i = 0; i < limit; i++) {
    const draw = await fetchDraw(next)
    if (!draw) {
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

  return {
    ok: true,
    inserted,
    nextDrawNo: next,
    stopped: firstFail !== null,
    message:
      inserted === 0
        ? '새로 추가된 회차가 없습니다. (외부 API 접근이 막혀 있거나 이미 최신 상태)'
        : `${inserted}개 회차를 적재했습니다. ${firstFail ? '(최신까지 완료)' : '더 남았으면 다시 호출하세요.'}`,
  }
}

export function clampLimit(v: unknown): number {
  return Math.min(Math.max(Number(v) || 200, 1), 200)
}
