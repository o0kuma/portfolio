export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS threaded_comments (
      id SERIAL PRIMARY KEY,
      post_id VARCHAR(255) NOT NULL,
      parent_id INTEGER REFERENCES threaded_comments(id) ON DELETE CASCADE,
      author_name VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_threaded_comments_post_id ON threaded_comments(post_id);
  `)
  const result = await dbQuery(
    `SELECT id, post_id, parent_id, author_name, content, created_at
     FROM threaded_comments WHERE post_id = $1 ORDER BY created_at ASC`,
    [id],
  )
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    const body = await req.json() as {
      author_name?: string
      content?: string
      parent_id?: number | null
      // legacy flat-comment fields
      author?: string
    }

    const authorName = (body.author_name ?? body.author ?? '').trim()
    const content = (body.content ?? '').trim()

    if (!authorName || !content) {
      return NextResponse.json({ message: '작성자와 댓글 내용은 필수입니다.' }, { status: 400 })
    }

    const result = await dbQuery(
      `INSERT INTO threaded_comments (post_id, parent_id, author_name, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, body.parent_id ?? null, authorName.slice(0, 100), content.slice(0, 2000)],
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts/[id]/comments POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
