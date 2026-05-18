export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '6', 10)))

    const result = await dbQuery(
      `SELECT * FROM projects WHERE featured = true ORDER BY created_at DESC LIMIT $1`,
      [limit],
    )

    return NextResponse.json({
      projects: result.rows,
      count: result.rows.length,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/projects/featured GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
