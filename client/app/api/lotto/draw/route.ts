export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { z } from 'zod'
import { dbQuery } from '@/lib/neon-server'

// ── Lotto 6/45 rules ──────────────────────────────────────────────────────────
// rank: 1~5 winning tiers, 0 = no prize
const PRIZE: Record<number, number> = {
  1: 2_000_000_000, // 6 matched
  2: 50_000_000,    // 5 + bonus
  3: 1_500_000,     // 5 matched
  4: 50_000,        // 4 matched
  5: 5_000,         // 3 matched
  0: 0,
}
const TICKET_COST = 1000
const MAX_POSTS_PER_SESSION_PER_DAY = 200

const PostSchema = z.object({
  playerName: z.string().max(50).optional(),
  sessionId: z.string().max(100).optional(),
  picked: z
    .array(z.number().int().min(1).max(45))
    .length(6)
    .refine((arr) => new Set(arr).size === 6, { message: '중복된 번호가 있습니다.' }),
  mode: z.enum(['sim', 'history']).default('sim'),
  // history 모드에서만 사용: 특정 회차(없으면 랜덤 과거 회차)
  drawNo: z.number().int().min(1).max(9999).optional(),
})

function sanitizePlayerName(raw: unknown): string {
  if (typeof raw !== 'string') return 'Anonymous'
  const stripped = raw
    .trim()
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[<>&"']/g, '')
  if (stripped.length < 2 || stripped.length > 20) return 'Anonymous'
  return stripped
}

// Fisher-Yates with crypto randomness → 6 numbers + bonus, all distinct
function drawNumbers(): { drawn: number[]; bonus: number } {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const picked = pool.slice(0, 7)
  const drawn = picked.slice(0, 6).sort((a, b) => a - b)
  const bonus = picked[6]
  return { drawn, bonus }
}

function judge(picked: number[], drawn: number[], bonus: number): { matched: number; rank: number } {
  const drawnSet = new Set(drawn)
  const matched = picked.filter((n) => drawnSet.has(n)).length
  const hasBonus = picked.includes(bonus)
  let rank = 0
  if (matched === 6) rank = 1
  else if (matched === 5 && hasBonus) rank = 2
  else if (matched === 5) rank = 3
  else if (matched === 4) rank = 4
  else if (matched === 3) rank = 5
  return { matched, rank }
}

const MAX_HISTORY_DRAW = 1150 // 랜덤 과거 회차 상한 (대략 최신 회차)

interface DhLottoResponse {
  returnValue: string
  drwNo: number
  drwtNo1: number
  drwtNo2: number
  drwtNo3: number
  drwtNo4: number
  drwtNo5: number
  drwtNo6: number
  bnusNo: number
}

async function fetchHistoricalDraw(
  drawNo?: number,
): Promise<{ drawn: number[]; bonus: number; drawNo: number } | null> {
  // 시도: 지정 회차 → 실패 시 랜덤 과거 회차 몇 번 재시도
  const candidates: number[] = []
  if (drawNo) candidates.push(drawNo)
  for (let i = 0; i < 5; i++) candidates.push(randomInt(1, MAX_HISTORY_DRAW + 1))

  for (const no of candidates) {
    try {
      const res = await fetch(
        `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${no}`,
        { signal: AbortSignal.timeout(4000) },
      )
      if (!res.ok) continue
      const data = (await res.json()) as DhLottoResponse
      if (data.returnValue !== 'success') continue
      const drawn = [
        data.drwtNo1,
        data.drwtNo2,
        data.drwtNo3,
        data.drwtNo4,
        data.drwtNo5,
        data.drwtNo6,
      ].sort((a, b) => a - b)
      return { drawn, bonus: data.bnusNo, drawNo: data.drwNo }
    } catch {
      // try next candidate
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = PostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }
    const { picked, mode, drawNo } = parsed.data
    const playerName = sanitizePlayerName(parsed.data.playerName)

    let sessionId: string | null = null
    if (parsed.data.sessionId && parsed.data.sessionId.trim()) {
      const sid = parsed.data.sessionId.trim().slice(0, 64)
      if (/^[a-zA-Z0-9_-]+$/.test(sid)) sessionId = sid
    }

    // ── Draw (server-side for integrity) ──
    let drawn: number[]
    let bonus: number
    let resolvedDrawNo: number | null = null

    if (mode === 'history') {
      const hist = await fetchHistoricalDraw(drawNo)
      if (!hist) {
        return NextResponse.json(
          { message: '역대 회차 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 502 },
        )
      }
      drawn = hist.drawn
      bonus = hist.bonus
      resolvedDrawNo = hist.drawNo
    } else {
      const d = drawNumbers()
      drawn = d.drawn
      bonus = d.bonus
    }

    const { matched, rank } = judge(picked, drawn, bonus)
    const prize = PRIZE[rank] ?? 0

    // ── Record (best-effort; never blocks the result) ──
    try {
      await dbQuery(`
        CREATE TABLE IF NOT EXISTS lotto_plays (
          id SERIAL PRIMARY KEY,
          player_name VARCHAR(20) DEFAULT 'Anonymous',
          session_id VARCHAR(64),
          picked INT[] NOT NULL,
          drawn INT[] NOT NULL,
          bonus INT NOT NULL,
          matched INT NOT NULL,
          rank INT NOT NULL,
          prize BIGINT NOT NULL,
          mode VARCHAR(10) DEFAULT 'sim',
          draw_no INT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `)

      if (sessionId) {
        const countRes = await dbQuery<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM lotto_plays
           WHERE session_id = $1 AND created_at >= (timezone('utc', now())::date)`,
          [sessionId],
        )
        if (Number(countRes.rows[0]?.count ?? 0) >= MAX_POSTS_PER_SESSION_PER_DAY) {
          // 한도 초과 시 결과는 주되 기록은 생략
          return NextResponse.json({
            drawn,
            bonus,
            matched,
            rank,
            prize,
            cost: TICKET_COST,
            drawNo: resolvedDrawNo,
            recorded: false,
          })
        }
      }

      await dbQuery(
        `INSERT INTO lotto_plays
           (player_name, session_id, picked, drawn, bonus, matched, rank, prize, mode, draw_no)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [playerName, sessionId, picked, drawn, bonus, matched, rank, prize, mode, resolvedDrawNo],
      )
    } catch (dbErr) {
      console.error('[/api/lotto/draw] DB error:', dbErr)
      // 결과는 그대로 반환
    }

    return NextResponse.json({
      drawn,
      bonus,
      matched,
      rank,
      prize,
      cost: TICKET_COST,
      drawNo: resolvedDrawNo,
      recorded: true,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/lotto/draw POST]', msg)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}
