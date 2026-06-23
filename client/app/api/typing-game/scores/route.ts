export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function GET() {
  await dbQuery(`CREATE TABLE IF NOT EXISTS typing_scores (
    id SERIAL PRIMARY KEY, player_name VARCHAR(50), wpm INTEGER,
    accuracy INTEGER, created_at TIMESTAMPTZ DEFAULT NOW()
  )`)
  const r = await dbQuery('SELECT player_name, wpm, accuracy, created_at FROM typing_scores ORDER BY wpm DESC LIMIT 10')
  return NextResponse.json({ scores: r.rows })
}

export async function POST(req: NextRequest) {
  const { player_name, wpm, accuracy } = await req.json()
  if (!player_name || !wpm) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  await dbQuery('INSERT INTO typing_scores (player_name, wpm, accuracy) VALUES ($1,$2,$3)', [player_name.slice(0,50), Math.min(wpm,999), Math.min(accuracy,100)])
  return NextResponse.json({ ok: true })
}
