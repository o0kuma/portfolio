export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

const MAX_WAVE = 9_999
const MAX_KILLS = 9_999_999
const MAX_POSTS_PER_SESSION_PER_DAY = 10
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

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
    .replace(/[ -]/g, '')
    .replace(/[<>&"']/g, '')
  if (stripped.length < 2 || stripped.length > 20) return 'Anonymous'
  return stripped
}

function parseRequiredInt(raw: unknown, min: number, max: number): number | null {
  if (raw === undefined || raw === null) return null
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) return null
  return n
}

function parseLimit(searchParams: URLSearchParams): number {
  const raw = searchParams.get('limit')
  if (!raw) return DEFAULT_LIMIT
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT
  return Math.min(n, MAX_LIMIT)
}

export async function GET(request: NextRequest) {
  try {
    const limit = parseLimit(request.nextUrl.searchParams)
    const result = await dbQuery<TowerDefenseScoreRow>(
      `SELECT id, player_name, wave, kills, created_at
       FROM tower_defense_scores
       ORDER BY wave DESC, kills DESC, created_at ASC
       LIMIT $1`,
      [limit],
    )

    const scores = result.rows.map((row, index) => ({
      rank: index + 1,
      playerName: row.player_name,
      wave: row.wave,
      kills: row.kills,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ scores })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/tower-defense/scores GET]', msg)
    if (msg.includes('DATABASE_URL')) {
      return NextResponse.json({ message: '랭킹을 불러올 수 없습니다.' }, { status: 503 })
    }
    if (msg.includes('relation "tower_defense_scores"')) {
      return NextResponse.json({ message: 'DB 마이그레이션이 필요합니다.' }, { status: 503 })
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const wave = parseRequiredInt(body?.wave, 1, MAX_WAVE)
    if (wave === null) {
      return NextResponse.json({ message: '웨이브 값이 올바르지 않습니다.' }, { status: 400 })
    }

    const kills = parseRequiredInt(body?.kills, 0, MAX_KILLS)
    if (kills === null) {
      return NextResponse.json({ message: '처치 수가 올바르지 않습니다.' }, { status: 400 })
    }

    // Loose anti-cheat: kills should be plausible given waves cleared.
    if (kills > wave * 200 + 50) {
      return NextResponse.json({ message: '처치 수가 비정상적으로 높습니다.' }, { status: 400 })
    }

    const playerName = sanitizePlayerName(body?.playerName)
    let sessionId: string | null = null
    if (typeof body?.sessionId === 'string' && body.sessionId.trim()) {
      const sid = body.sessionId.trim().slice(0, 64)
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

    const insert = await dbQuery<{ id: string }>(
      `INSERT INTO tower_defense_scores (player_name, wave, kills, session_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [playerName, wave, kills, sessionId],
    )

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
