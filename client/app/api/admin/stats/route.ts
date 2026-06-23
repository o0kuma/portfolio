export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const [posts, projects, contacts, pending, postsThisWeek, visitors, tetris, survive, tower] =
      await Promise.allSettled([
        dbQuery<{ count: number }>('SELECT COUNT(*)::int AS count FROM posts'),
        dbQuery<{ count: number }>('SELECT COUNT(*)::int AS count FROM projects'),
        dbQuery<{ count: number }>('SELECT COUNT(*)::int AS count FROM contacts'),
        dbQuery<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM contacts WHERE status = 'unread' OR status = 'pending'`,
        ),
        dbQuery<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM posts WHERE created_at >= NOW() - INTERVAL '7 days'`,
        ),
        dbQuery<{ count: string }>('SELECT COUNT(*) AS count FROM visitor_count'),
        dbQuery<{ best_score: string }>('SELECT COALESCE(MAX(score), 0)::text AS best_score FROM tetris_scores'),
        dbQuery<{ best_level: string }>('SELECT COALESCE(MAX(level), 0)::text AS best_level FROM survive_scores'),
        dbQuery<{ best_wave: string }>('SELECT COALESCE(MAX(wave), 0)::text AS best_wave FROM tower_defense_scores'),
      ])

    const getRow = <T extends object>(r: PromiseSettledResult<{ rows: T[] }>, fallback: T): T =>
      r.status === 'fulfilled' ? (r.value.rows[0] ?? fallback) : fallback

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts: getRow(posts, { count: 0 }).count,
        totalProjects: getRow(projects, { count: 0 }).count,
        totalContacts: getRow(contacts, { count: 0 }).count,
        pendingContacts: getRow(pending, { count: 0 }).count,
        postsThisWeek: getRow(postsThisWeek, { count: 0 }).count,
        totalVisitors: Number(getRow(visitors, { count: '0' }).count),
        totalRestaurants: 0,
        gameStats: {
          tetrisBestScore: Number(getRow(tetris, { best_score: '0' }).best_score),
          surviveBestWave: Number(getRow(survive, { best_level: '0' }).best_level),
          towerBestWave: Number(getRow(tower, { best_wave: '0' }).best_wave),
        },
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
