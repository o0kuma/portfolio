export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '9', 10)))
    const category = searchParams.get('category') ?? ''
    const featured = searchParams.get('featured') ?? ''
    const search = searchParams.get('search') ?? ''
    const q = searchParams.get('q')?.trim() ?? ''
    const tag = searchParams.get('tag')?.trim() ?? ''
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
    if (tag) {
      values.push(tag)
      where.push(`$${values.length} = ANY(tags)`)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    // Full-text search with tsvector when ?q= is provided
    if (q) {
      values.push(q)
      const qIdx = values.length
      const tsCondition = `to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')) @@ plainto_tsquery('english', $${qIdx})`
      const tsWhere = where.length
        ? `WHERE ${where.join(' AND ')} AND ${tsCondition}`
        : `WHERE ${tsCondition}`

      const countResult = await dbQuery<{ total: number }>(
        `SELECT COUNT(*)::int AS total FROM posts ${tsWhere}`,
        values,
      )
      const total: number = countResult.rows[0]?.total ?? 0

      values.push(limit, offset)
      const postsResult = await dbQuery(
        `SELECT *, ts_rank(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')), plainto_tsquery('english', $${qIdx})) AS rank
         FROM posts ${tsWhere}
         ORDER BY rank DESC, created_at DESC
         LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values,
      )

      return NextResponse.json({
        posts: postsResult.rows,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      })
    }

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
    if (!(await isAdminAuthorized(request))) {
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
    revalidateTag('posts')
    return NextResponse.json({ message: '포스트가 생성되었습니다.', post: result.rows[0] }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
