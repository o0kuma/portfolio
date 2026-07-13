export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { dbQuery } from '@/lib/neon-server'
import { isAdminRequest } from '@/lib/requireAdmin'

type Ctx = { params: Promise<{ id: string }> }

const ALLOWED_POST_COLUMNS = new Set([
  'title',
  'content',
  'author',
  'category',
  'tags',
  'featured',
  'cover_image_url',
  'status',
  'series',
])

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params

    await dbQuery('UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = $1', [id])

    const postResult = await dbQuery('SELECT * FROM posts WHERE id = $1 LIMIT 1', [id])
    const post = postResult.rows[0]
    if (!post) {
      return NextResponse.json({ message: '포스트를 찾을 수 없습니다.' }, { status: 404 })
    }

    const comments = await fetchPostComments(id)

    return NextResponse.json({ ...post, comments })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts/[id] GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

async function fetchPostComments(postId: string) {
  try {
    const merged = await dbQuery(
      `SELECT id::text, author, content, created_at
       FROM comments
       WHERE post_id::text = $1
       UNION ALL
       SELECT id::text, author_name AS author, content, created_at
       FROM threaded_comments
       WHERE post_id = $1
       ORDER BY created_at ASC`,
      [postId],
    )
    return merged.rows
  } catch {
    const legacy = await dbQuery(
      'SELECT * FROM comments WHERE post_id::text = $1 ORDER BY created_at ASC',
      [postId],
    )
    return legacy.rows
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ message: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const entries = Object.entries(body ?? {}).filter(([k]) => ALLOWED_POST_COLUMNS.has(k))
    if (!entries.length) {
      return NextResponse.json({ message: '수정할 내용이 없습니다.' }, { status: 400 })
    }

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ')
    const values = entries.map(([, v]) => v)
    values.push(id)

    const result = await dbQuery(
      `UPDATE posts SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values,
    )
    if (!result.rows[0]) {
      return NextResponse.json({ message: '포스트를 찾을 수 없습니다.' }, { status: 404 })
    }
    revalidateTag('posts', 'max')
    return NextResponse.json({ message: '포스트가 업데이트되었습니다.', post: result.rows[0] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts/[id] PUT]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ message: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = await params
    await dbQuery('DELETE FROM posts WHERE id = $1', [id])
    revalidateTag('posts', 'max')
    return NextResponse.json({ message: '포스트가 삭제되었습니다.' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts/[id] DELETE]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
