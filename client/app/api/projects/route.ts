export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))
    const category = searchParams.get('category') ?? ''
    const featured = searchParams.get('featured') ?? ''
    const search = searchParams.get('search') ?? ''
    const offset = (page - 1) * limit

    const where: string[] = []
    const values: unknown[] = []

    if (category) {
      values.push(category)
      where.push(`category = $${values.length}`)
    }
    if (featured === 'true') {
      values.push(true)
      where.push(`featured = $${values.length}`)
    }
    if (search) {
      values.push(`%${search}%`)
      where.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length} OR content ILIKE $${values.length})`)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const countResult = await dbQuery<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM projects ${whereClause}`,
      values,
    )
    const total: number = countResult.rows[0]?.total ?? 0

    values.push(limit, offset)
    const result = await dbQuery(
      `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    )

    return NextResponse.json({
      projects: result.rows,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/projects GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminToken = process.env.ADMIN_API_TOKEN
    const auth = request.headers.get('authorization') ?? ''
    const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''

    if (!adminToken || provided !== adminToken) {
      return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.title || !body.description || !body.content) {
      return NextResponse.json({ message: '제목, 설명, 내용은 필수입니다.' }, { status: 400 })
    }

    const result = await dbQuery(
      `INSERT INTO projects
        (title, description, content, technologies, images, github_url, live_url,
         featured, category, status, start_date, end_date)
       VALUES ($1, $2, $3, $4::text[], $5::text[], $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        body.title,
        body.description,
        body.content,
        body.technologies ?? [],
        body.images ?? [],
        body.githubUrl ?? body.github_url ?? null,
        body.liveUrl ?? body.live_url ?? null,
        body.featured ?? false,
        body.category ?? 'web',
        body.status ?? 'completed',
        body.startDate ?? body.start_date ?? null,
        body.endDate ?? body.end_date ?? null,
      ],
    )

    return NextResponse.json(
      { message: '프로젝트가 생성되었습니다.', project: result.rows[0] },
      { status: 201 },
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/projects POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
