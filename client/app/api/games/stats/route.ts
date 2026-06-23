export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

type TetrisStats = {
  bestScore: number
  bestStage: number
  totalGames: number
  avgScore: number
}

type SurviveStats = {
  bestTimeSec: number
  bestLevel: number
  totalGames: number
}

type TowerDefenseStats = {
  bestWave: number
  totalGames: number
}

export type GamesStatsResponse = {
  tetris: TetrisStats
  survive: SurviveStats
  towerDefense: TowerDefenseStats
}

export async function GET() {
  try {
    const [tetrisRes, surviveRes, tdRes] = await Promise.all([
      dbQuery<{ best_score: string; best_stage: string; total_games: string; avg_score: string }>(
        `SELECT
           COALESCE(MAX(score), 0)::text AS best_score,
           COALESCE(MAX(stage), 0)::text AS best_stage,
           COUNT(*)::text AS total_games,
           COALESCE(AVG(score), 0)::text AS avg_score
         FROM tetris_scores`,
        [],
      ),
      dbQuery<{ best_time_sec: string; best_level: string; total_games: string }>(
        `SELECT
           COALESCE(MAX(time_sec), 0)::text AS best_time_sec,
           COALESCE(MAX(level), 0)::text AS best_level,
           COUNT(*)::text AS total_games
         FROM survive_scores`,
        [],
      ),
      dbQuery<{ best_wave: string; total_games: string }>(
        `SELECT
           COALESCE(MAX(wave), 0)::text AS best_wave,
           COUNT(*)::text AS total_games
         FROM tower_defense_scores`,
        [],
      ),
    ])

    const t = tetrisRes.rows[0]
    const s = surviveRes.rows[0]
    const td = tdRes.rows[0]

    const stats: GamesStatsResponse = {
      tetris: {
        bestScore: Number(t?.best_score ?? 0),
        bestStage: Number(t?.best_stage ?? 0),
        totalGames: Number(t?.total_games ?? 0),
        avgScore: Math.round(Number(t?.avg_score ?? 0)),
      },
      survive: {
        bestTimeSec: Number(s?.best_time_sec ?? 0),
        bestLevel: Number(s?.best_level ?? 0),
        totalGames: Number(s?.total_games ?? 0),
      },
      towerDefense: {
        bestWave: Number(td?.best_wave ?? 0),
        totalGames: Number(td?.total_games ?? 0),
      },
    }

    return NextResponse.json(stats)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/games/stats GET]', msg)
    if (msg.includes('DATABASE_URL')) {
      return NextResponse.json({ message: '통계를 불러올 수 없습니다.' }, { status: 503 })
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
