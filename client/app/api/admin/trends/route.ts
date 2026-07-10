export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

interface DayCountRow {
  day: string
  count: string
}

const dayCountQuery = (table: string, dateExpr: string) => `
  SELECT d::date::text AS day, COUNT(t.*)::text AS count
  FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') AS d
  LEFT JOIN ${table} t ON ${dateExpr} = d::date
  GROUP BY d
  ORDER BY d
`

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const [tetris, survive, tower, ai] = await Promise.allSettled([
      dbQuery<DayCountRow>(dayCountQuery('tetris_scores', 'date_trunc(\'day\', t.created_at)')),
      dbQuery<DayCountRow>(dayCountQuery('survive_scores', 'date_trunc(\'day\', t.created_at)')),
      dbQuery<DayCountRow>(dayCountQuery('tower_defense_scores', 'date_trunc(\'day\', t.created_at)')),
      dbQuery<{ day: string; count: string }>(`
        SELECT d::date::text AS day, COALESCE(SUM(a.message_count), 0)::text AS count
        FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') AS d
        LEFT JOIN ai_usage a ON a.date = d::date
        GROUP BY d
        ORDER BY d
      `),
    ])

    const toSeries = (r: PromiseSettledResult<{ rows: DayCountRow[] }>) =>
      r.status === 'fulfilled' ? r.value.rows.map((row) => ({ day: row.day, count: Number(row.count) })) : []

    return NextResponse.json({
      success: true,
      games: {
        tetris: toSeries(tetris),
        survive: toSeries(survive),
        towerDefense: toSeries(tower),
      },
      aiUsage: toSeries(ai),
    })
  } catch (error: unknown) {
    console.error('[/api/admin/trends GET]', error instanceof Error ? error.message : error)
    return NextResponse.json({ success: false, error: '추이 데이터를 불러오지 못했습니다.' }, { status: 500 })
  }
}
