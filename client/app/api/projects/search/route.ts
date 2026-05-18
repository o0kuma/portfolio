export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

// GET /api/projects/search?q=<term>
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const term = (searchParams.get('q') ?? searchParams.get('term') ?? '').trim()

    if (!term) {
      return NextResponse.json({ message: '검색어를 입력해주세요.' }, { status: 400 })
    }

    const result = await dbQuery(
      `SELECT * FROM projects
       WHERE title ILIKE $1
          OR description ILIKE $1
          OR content ILIKE $1
          OR $1 = ANY(technologies)
       ORDER BY created_at DESC`,
      [`%${term}%`],
    )

    return NextResponse.json({
      projects: result.rows,
      searchTerm: term,
      count: result.rows.length,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/projects/search GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
