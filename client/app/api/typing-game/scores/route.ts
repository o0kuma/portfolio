export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export type TypingScoreRow = {
  id: string
  player_name: string
  wpm: number
  accuracy: number
  created_at: string
}

function sanitize(raw: unknown): string {
  if (typeof raw !== 'string') return 'Anonymous'
  const s = raw.trim().replace(/[ -<>&"']/g, '')
  return s.length >= 1 && s.length <= 50 ? s : 'Anonymous'
}

export async function GET() {
  await dbQuery(`CREATE TABLE IF NOT EXISTS typing_scores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50),
    wpm INTEGER,
    accuracy INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`)
  const result = await dbQuery<TypingScoreRow>(
    `SELECT id, player_name, wpm, accuracy, created_at FROM typing_scores ORDER BY wpm DESC LIMIT 10`
  )
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const player_name = sanitize(body.player_name)
  const wpm = Math.max(0, Math.min(300, parseInt(body.wpm, 10) || 0))
  const accuracy = Math.max(0, Math.min(100, parseInt(body.accuracy, 10) || 0))

  await dbQuery(`CREATE TABLE IF NOT EXISTS typing_scores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50),
    wpm INTEGER,
    accuracy INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`)
  await dbQuery(
    `INSERT INTO typing_scores (player_name, wpm, accuracy) VALUES ($1, $2, $3)`,
    [player_name, wpm, accuracy]
  )
  return NextResponse.json({ ok: true })
}
