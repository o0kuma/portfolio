export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { dbQuery } from '@/lib/neon-server'

const MAX_POSTS_PER_SESSION_PER_DAY = 10

const GetSchema = z.object({
  day: z.string().regex(/^\d{8}$/).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
})

const PostSchema = z.object({
  playerName: z.string().max(50).optional(),
  wave: z.number().int().min(1).max(9_999),
  kills: z.number().int().min(0).max(9_999_999),
  sessionId: z.string().max(100).optional(),
  challengeDay: z.string().regex(/^\d{8}$/).optional(),
})

export type TowerDefenseScoreRow = {
  id: string
  player_name: string
  wave: number
  kills: number
  created_at: string
}

function sanitizePlayerName(raw: unknown): string {
  if (typeof raw !== 'string') return 'Anonymous'
  const stripped = raw
    .trim()
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[<>&"']/g, '')
  if (stripped.length < 2 || stripped.length > 20) return 'Anonymous'
  return stripped
}

/** True when the DB error is a missing challenge_day column (migration not run). */
function isMissingChallengeColumn(msg: string): boolean {
  return msg.includes('challenge_day') && /column|does not exist|undefined/i.test(msg)
}

const fetchLeaderboard = unstable_cache(
  async (day: string | undefined, limit: number) => {
    let result
    if (day) {
      // Daily-challenge leaderboard for the requested day.
      result = await dbQuery<TowerDefenseScoreRow>(
        `SELECT id, player_name, wave, kills, created_at
         FROM tower_defense_scores
         WHERE challenge_day = $2
         ORDER BY wave DESC, kills DESC, created_at ASC
         LIMIT $1`,
        [limit, day],
      )
    } else {
      // Normal mode: rows not tagged to a challenge (when the column exists).
      // Use COALESCE so the query is safe even if every row predates the column.
      try {
        result = await dbQuery<TowerDefenseScoreRow>(
          `SELECT id, player_name, wave, kills, created_at
           FROM tower_defense_scores
           WHERE challenge_day IS NULL
           ORDER BY wave DESC, kills DESC, created_at ASC
           LIMIT $1`,
          [limit],
        )
      } catch (inner: unknown) {
        const im = inner instanceof Error ? inner.message : ''
        if (!isMissingChallengeColumn(im)) throw inner
        // Migration not applied: fall back to the original unfiltered query.
        result = await dbQuery<TowerDefenseScoreRow>(
          `SELECT id, player_name, wave, kills, created_at
           FROM tower_defense_scores
           ORDER BY wave DESC, kills DESC, created_at ASC
           LIMIT $1`,
          [limit],
        )
      }
    }

    return result.rows.map((row, index) => ({
      rank: index + 1,
      playerName: row.player_name,
      wave: row.wave,
      kills: row.kills,
      createdAt: row.created_at,
    }))
  },
  ['td-leaderboard'],
  { revalidate: 30, tags: ['td-leaderboard'] },
)

export async function GET(request: NextRequest) {
  try {
    const parsed = GetSchema.safeParse({
      day: request.nextUrl.searchParams.get('day') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }
    const { day, limit } = parsed.data

    const scores = await fetchLeaderboard(day, limit)
    return NextResponse.json({ scores })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/tower-defense/scores GET]', msg)
    if (msg.includes('DATABASE_URL')) {
      return NextResponse.json({ message: '랭킹을 불러올 수 없습니다.' }, { status: 503 })
    }
    if (msg.includes('relation "tower_defense_scores"') || isMissingChallengeColumn(msg)) {
      return NextResponse.json({ message: 'DB 마이그레이션이 필요합니다.' }, { status: 503 })
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = PostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }
    const { wave, kills, sessionId: rawSessionId, challengeDay } = parsed.data

    // Loose anti-cheat: kills should be plausible given waves cleared.
    if (kills > wave * 200 + 50) {
      return NextResponse.json({ message: '처치 수가 비정상적으로 높습니다.' }, { status: 400 })
    }

    const playerName = sanitizePlayerName(parsed.data.playerName)

    let sessionId: string | null = null
    if (rawSessionId && rawSessionId.trim()) {
      const sid = rawSessionId.trim().slice(0, 64)
      if (/^[a-zA-Z0-9_-]+$/.test(sid)) sessionId = sid
    }

    if (sessionId) {
      const countRes = await dbQuery<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM tower_defense_scores
         WHERE session_id = $1
           AND created_at >= (timezone('utc', now())::date)`,
        [sessionId],
      )
      const count = Number(countRes.rows[0]?.count ?? 0)
      if (count >= MAX_POSTS_PER_SESSION_PER_DAY) {
        return NextResponse.json({ message: '오늘 제출 한도에 도달했습니다.' }, { status: 429 })
      }
    }

    let insert
    if (challengeDay) {
      try {
        insert = await dbQuery<{ id: string }>(
          `INSERT INTO tower_defense_scores (player_name, wave, kills, session_id, challenge_day)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [playerName, wave, kills, sessionId, challengeDay],
        )
      } catch (inner: unknown) {
        const im = inner instanceof Error ? inner.message : ''
        if (!isMissingChallengeColumn(im)) throw inner
        // Migration not applied: store as a normal score so play isn't lost.
        insert = await dbQuery<{ id: string }>(
          `INSERT INTO tower_defense_scores (player_name, wave, kills, session_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [playerName, wave, kills, sessionId],
        )
      }
    } else {
      insert = await dbQuery<{ id: string }>(
        `INSERT INTO tower_defense_scores (player_name, wave, kills, session_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [playerName, wave, kills, sessionId],
      )
    }

    revalidateTag('td-leaderboard', 'max')
    return NextResponse.json({ ok: true, id: insert.rows[0]?.id })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/tower-defense/scores POST]', msg)
    if (msg.includes('DATABASE_URL')) {
      return NextResponse.json({ message: '점수를 저장할 수 없습니다.' }, { status: 503 })
    }
    if (msg.includes('relation "tower_defense_scores"')) {
      return NextResponse.json(
        { message: '랭킹 테이블이 없습니다. DB 마이그레이션을 실행해 주세요.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
