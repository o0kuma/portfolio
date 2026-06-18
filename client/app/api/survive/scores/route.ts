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
  playerName: z.string().min(1).max(50),
  timeSec: z.number().int().min(1).max(99_999),
  level: z.number().int().min(1).max(999),
  kills: z.number().int().min(0).max(999_999),
  sessionId: z.string().max(100).optional(),
})

export type SurviveScoreRow = {
  id: string
  player_name: string
  time_sec: number
  level: number
  kills: number
  created_at: string
}

function sanitizePlayerName(raw: unknown): string {
  if (typeof raw !== 'string') return 'Anonymous'
  const stripped = raw
    .trim()
    .replace(/[ -]/g, '')
    .replace(/[<>&"']/g, '')
  if (stripped.length < 2 || stripped.length > 20) return 'Anonymous'
  return stripped
}

const fetchLeaderboard = unstable_cache(
  async (limit: number) => {
    const result = await dbQuery<SurviveScoreRow>(
      `SELECT id, player_name, time_sec, level, kills, created_at
       FROM survive_scores
       ORDER BY time_sec DESC, kills DESC, created_at ASC
       LIMIT $1`,
      [limit],
    )

    return result.rows.map((row, index) => ({
      rank: index + 1,
      playerName: row.player_name,
      timeSec: row.time_sec,
      level: row.level,
      kills: row.kills,
      createdAt: row.created_at,
    }))
  },
  ['survive-leaderboard'],
  { revalidate: 30, tags: ['survive-leaderboard'] },
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
    const { limit } = parsed.data

    const scores = await fetchLeaderboard(limit)
    return NextResponse.json({ scores })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/survive/scores GET]', msg)
    if (msg.includes('DATABASE_URL')) {
      return NextResponse.json({ message: '랭킹을 불러올 수 없습니다.' }, { status: 503 })
    }
    if (msg.includes('relation "survive_scores"')) {
      return NextResponse.json(
        { message: 'DB 마이그레이션이 필요합니다.' },
        { status: 503 },
      )
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
    const { timeSec, level, kills, sessionId: rawSessionId } = parsed.data

    // Loose anti-cheat: level should be plausible given time survived
    if (level > Math.max(1, Math.floor(timeSec / 10) + 2)) {
      return NextResponse.json({ message: '레벨이 비정상적으로 높습니다.' }, { status: 400 })
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
         FROM survive_scores
         WHERE session_id = $1
           AND created_at >= (timezone('utc', now())::date)`,
        [sessionId],
      )
      const count = Number(countRes.rows[0]?.count ?? 0)
      if (count >= MAX_POSTS_PER_SESSION_PER_DAY) {
        return NextResponse.json(
          { message: '오늘 제출 한도에 도달했습니다.' },
          { status: 429 },
        )
      }
    }

    const insert = await dbQuery<{ id: string }>(
      `INSERT INTO survive_scores (player_name, time_sec, level, kills, session_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [playerName, timeSec, level, kills, sessionId],
    )

    revalidateTag('survive-leaderboard')
    return NextResponse.json({ ok: true, id: insert.rows[0]?.id })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/survive/scores POST]', msg)
    if (msg.includes('DATABASE_URL')) {
      return NextResponse.json({ message: '점수를 저장할 수 없습니다.' }, { status: 503 })
    }
    if (msg.includes('relation "survive_scores"')) {
      return NextResponse.json(
        { message: '랭킹 테이블이 없습니다. DB 마이그레이션을 실행해 주세요.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
