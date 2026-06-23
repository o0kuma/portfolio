export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function GET() {
  try {
    const result = await dbQuery<{ series: string; count: string; latest: string }>(
      `SELECT series, COUNT(*) as count, MAX(created_at) as latest
       FROM posts
       WHERE series IS NOT NULL AND series != '' AND status = 'published'
       GROUP BY series
       ORDER BY latest DESC`
    )

    return NextResponse.json({
      success: true,
      series: result.rows.map((r) => ({
        name: r.series,
        count: parseInt(r.count, 10),
        latest: r.latest,
      })),
    })
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json({ success: false, error: '시리즈 목록을 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
