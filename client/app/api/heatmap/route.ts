export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

interface SectionStat {
  section: string
  views: number
  totalDuration: number
  avgDuration: number
}

// Aggregate table: one row per section, counters accumulated via UPSERT.
// Stays tiny (rows = number of sections) regardless of traffic.
async function ensureTable() {
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS heatmap_stats (
      section VARCHAR(64) PRIMARY KEY,
      views BIGINT NOT NULL DEFAULT 0,
      total_duration BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { section, duration } = body as { section: string; duration: number }

    if (typeof section !== 'string' || !section.trim() || section.length > 64) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }
    if (typeof duration !== 'number' || !Number.isFinite(duration) || duration < 0) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
    }

    // Cap duration to avoid garbage values inflating totals (max 1 hour)
    const dur = Math.min(Math.round(duration), 60 * 60 * 1000)

    await ensureTable()
    await dbQuery(
      `INSERT INTO heatmap_stats (section, views, total_duration, updated_at)
       VALUES ($1, 1, $2, NOW())
       ON CONFLICT (section) DO UPDATE SET
         views = heatmap_stats.views + 1,
         total_duration = heatmap_stats.total_duration + EXCLUDED.total_duration,
         updated_at = NOW()`,
      [section.trim(), dur]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Heatmap POST error:', err)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function GET() {
  try {
    await ensureTable()
    const result = await dbQuery<{ section: string; views: string; total_duration: string }>(
      `SELECT section, views, total_duration FROM heatmap_stats ORDER BY views DESC`
    )

    const stats: SectionStat[] = result.rows.map((row) => {
      const views = Number(row.views)
      const totalDuration = Number(row.total_duration)
      return {
        section: row.section,
        views,
        totalDuration,
        avgDuration: views > 0 ? Math.round(totalDuration / views) : 0,
      }
    })

    return NextResponse.json(stats)
  } catch (err) {
    console.error('Heatmap GET error:', err)
    return NextResponse.json([], { status: 200 })
  }
}
