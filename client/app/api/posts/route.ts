export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '9', 10)))
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
      where.push(`(title ILIKE $${values.length} OR content ILIKE $${values.length})`)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const countResult = await dbQuery<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM posts ${whereClause}`,
      values,
    )
    const total: number = countResult.rows[0]?.total ?? 0

    values.push(limit, offset)
    const postsResult = await dbQuery(
      `SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    )

    return NextResponse.json({
      posts: postsResult.rows,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts GET]', msg)
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
    if (!body.title || !body.content || !body.author) {
      return NextResponse.json({ message: '제목, 내용, 작성자는 필수입니다.' }, { status: 400 })
    }

    const result = await dbQuery(
      `INSERT INTO posts (title, content, author, category, tags, likes, views, featured, cover_image_url, status)
       VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9, $10) RETURNING *`,
      [
        body.title,
        body.content,
        body.author ?? 'iykyk',
        body.category ?? 'general',
        body.tags ?? [],
        body.likes ?? 0,
        body.views ?? 0,
        body.featured ?? false,
        body.cover_image_url ?? null,
        body.status ?? 'published',
      ],
    )
    return NextResponse.json({ message: '포스트가 생성되었습니다.', post: result.rows[0] }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
