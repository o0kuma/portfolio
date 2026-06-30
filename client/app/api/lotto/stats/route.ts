export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { dbQuery } from '@/lib/neon-server'

interface FreqRow {
  n: number
  cnt: string
  last_draw: number | null
}

// 빈도 통계: lotto_draw_history(실제 역대 당첨번호)에서 계산.
// 데이터가 없으면 available:false 반환 → 프론트는 밸런스 추천만 노출.
const computeStats = unstable_cache(
  async () => {
    // 테이블 없으면 통계 불가
    const exists = await dbQuery<{ exists: boolean }>(
      `SELECT to_regclass('public.lotto_draw_history') IS NOT NULL AS exists`,
    )
    if (!exists.rows[0]?.exists) {
      return { available: false as const }
    }

    const totalRes = await dbQuery<{ cnt: string }>(
      `SELECT COUNT(*)::text AS cnt FROM lotto_draw_history`,
    )
    const totalDraws = Number(totalRes.rows[0]?.cnt ?? 0)
    if (totalDraws === 0) return { available: false as const }

    // 각 번호의 출현 횟수와 마지막으로 나온 회차
    const freq = await dbQuery<FreqRow>(`
      WITH nums AS (
        SELECT draw_no, unnest(ARRAY[n1,n2,n3,n4,n5,n6]) AS n FROM lotto_draw_history
      )
      SELECT g.n AS n,
             COUNT(nums.n)::text AS cnt,
             MAX(nums.draw_no) AS last_draw
      FROM generate_series(1,45) AS g(n)
      LEFT JOIN nums ON nums.n = g.n
      GROUP BY g.n
      ORDER BY g.n
    `)

    const latestRes = await dbQuery<{ max: number }>(
      `SELECT MAX(draw_no) AS max FROM lotto_draw_history`,
    )
    const latest = Number(latestRes.rows[0]?.max ?? 0)

    const counts = freq.rows.map((r) => ({
      n: Number(r.n),
      count: Number(r.cnt),
      sinceLast: r.last_draw ? latest - Number(r.last_draw) : latest, // 미출현 기간(회차)
    }))

    const hot = [...counts].sort((a, b) => b.count - a.count).slice(0, 10).map((c) => c.n)
    const cold = [...counts].sort((a, b) => b.sinceLast - a.sinceLast).slice(0, 10).map((c) => c.n)

    return {
      available: true as const,
      totalDraws,
      latestDraw: latest,
      counts, // 번호별 출현 횟수 (차트용)
      hot,
      cold,
    }
  },
  ['lotto-stats'],
  { revalidate: 3600, tags: ['lotto-stats'] },
)

export async function GET() {
  try {
    const stats = await computeStats()
    return NextResponse.json(stats)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/lotto/stats GET]', msg)
    return NextResponse.json({ available: false })
  }
}
