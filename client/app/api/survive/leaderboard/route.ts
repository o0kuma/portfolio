export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function GET() {
  try {
    const result = await dbQuery<{
      player_name: string
      time_sec: number
      level: number
      kills: number
      created_at: string
    }>(
      `SELECT player_name, time_sec, level, kills, created_at
       FROM survive_scores
       ORDER BY time_sec DESC, kills DESC
       LIMIT 10`,
    )

    const scores = result.rows.map((row, i) => ({
      rank: i + 1,
      playerName: row.player_name,
      timeSec: row.time_sec,
      level: row.level,
      kills: row.kills,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ scores })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
