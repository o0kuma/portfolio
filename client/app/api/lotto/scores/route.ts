export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { dbQuery } from '@/lib/neon-server'

const GetSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
})

type LottoAggRow = {
  player_name: string
  plays: string
  best_rank: string | null
  wins: string
  total_prize: string
  last_at: string
}

// 리더보드: 플레이어(이름) 단위 집계.
// 정렬 우선순위: 최고 등수(낮을수록 좋음, 0=꽝 제외) → 누적 당첨금 → 당첨 횟수
export async function GET(request: NextRequest) {
  try {
    const parsed = GetSchema.safeParse({
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }
    const { limit } = parsed.data

    const result = await dbQuery<LottoAggRow>(
      `SELECT
         player_name,
         COUNT(*)::text AS plays,
         MIN(NULLIF(rank, 0))::text AS best_rank,
         COUNT(*) FILTER (WHERE rank > 0)::text AS wins,
         COALESCE(SUM(prize), 0)::text AS total_prize,
         MAX(created_at) AS last_at
       FROM lotto_plays
       WHERE player_name <> 'Anonymous'
       GROUP BY player_name
       HAVING COUNT(*) FILTER (WHERE rank > 0) > 0
       ORDER BY MIN(NULLIF(rank, 0)) ASC NULLS LAST,
                SUM(prize) DESC,
                COUNT(*) FILTER (WHERE rank > 0) DESC
       LIMIT $1`,
      [limit],
    )

    const scores = result.rows.map((row, index) => {
      const bestRank = row.best_rank ? Number(row.best_rank) : null
      return {
        rank: index + 1,
        player_name: row.player_name,
        bestRank: bestRank ? `${bestRank}등` : '-',
        wins: Number(row.wins),
        totalPrize: Number(row.total_prize),
        plays: Number(row.plays),
        createdAt: row.last_at,
      }
    })

    return NextResponse.json({ scores })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/lotto/scores GET]', msg)
    if (msg.includes('DATABASE_URL') || msg.includes('relation "lotto_plays"')) {
      return NextResponse.json({ scores: [] })
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
