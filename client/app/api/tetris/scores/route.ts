export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { dbQuery } from '@/lib/neon-server'

const MAX_SCORE = 999_999
const MAX_STAGE = 10
const LINES_PER_STAGE = 20
const MAX_POSTS_PER_SESSION_PER_DAY = 10

const GetSchema = z.object({
  day: z.string().regex(/^\d{8}$/).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
})

const PostSchema = z.object({
  playerName: z.string().max(50).optional(),
  score: z.number().int().min(1).max(MAX_SCORE),
  lines: z.number().int().min(0).max(MAX_SCORE),
  stage: z.number().int().min(1).max(MAX_STAGE),
  level: z.number().int().min(0).max(99).optional().nullable(),
  sessionId: z.string().max(100).optional(),
})

export type TetrisScoreRow = {
  id: string
  player_name: string
  score: number
  lines: number
  level: number | null
  stage: number
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

function expectedStageFromLines(lines: number): number {
  return Math.min(MAX_STAGE, 1 + Math.floor(lines / LINES_PER_STAGE))
}

/** Reported stage must match line-clear progression. */
function stageLinesConsistent(stage: number, lines: number): boolean {
  return stage === expectedStageFromLines(lines)
}

/** Loose anti-cheat: score should be plausible for reported line clears. */
function scoreLinesConsistent(score: number, lines: number): boolean {
  if (lines > 0 && score < lines * 40) return false
  if (lines > 0 && score > lines * 80_000) return false
  return true
}

const fetchLeaderboard = unstable_cache(
  async (limit: number) => {
    const result = await dbQuery<TetrisScoreRow>(
      `SELECT id, player_name, score, lines, level, stage, created_at
       FROM tetris_scores
       ORDER BY stage DESC, lines DESC, score DESC, created_at ASC
       LIMIT $1`,
      [limit],
    )

    return result.rows.map((row, index) => ({
      rank: index + 1,
      playerName: row.player_name,
      score: row.score,
      lines: row.lines,
      stage: row.stage,
      level: row.level,
      createdAt: row.created_at,
    }))
  },
  ['tetris-leaderboard'],
  { revalidate: 30, tags: ['tetris-leaderboard'] },
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
    console.error('[/api/tetris/scores GET]', msg)
    if (msg.includes('DATABASE_URL')) {
      return NextResponse.json({ message: '랭킹을 불러올 수 없습니다.' }, { status: 503 })
    }
    if (msg.includes('column "stage"')) {
      return NextResponse.json(
        { message: 'stage 컬럼이 없습니다. DB 마이그레이션을 실행해 주세요.' },
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
    const { score, lines, stage, level, sessionId: rawSessionId } = parsed.data

    if (!stageLinesConsistent(stage, lines)) {
      return NextResponse.json(
        { message: '단계와 라인 수가 일치하지 않습니다.' },
        { status: 400 },
      )
    }

    if (!scoreLinesConsistent(score, lines)) {
      return NextResponse.json({ message: '점수와 라인이 일치하지 않습니다.' }, { status: 400 })
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
         FROM tetris_scores
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
      `INSERT INTO tetris_scores (player_name, score, lines, level, stage, session_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [playerName, score, lines, level ?? null, stage, sessionId],
    )

    revalidateTag('tetris-leaderboard', 'max')
    return NextResponse.json({ ok: true, id: insert.rows[0]?.id })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/tetris/scores POST]', msg)
    if (msg.includes('DATABASE_URL')) {
      return NextResponse.json({ message: '점수를 저장할 수 없습니다.' }, { status: 503 })
    }
    if (msg.includes('relation "tetris_scores"') || msg.includes('column "stage"')) {
      return NextResponse.json(
        { message: '랭킹 테이블이 없습니다. DB 마이그레이션을 실행해 주세요.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
