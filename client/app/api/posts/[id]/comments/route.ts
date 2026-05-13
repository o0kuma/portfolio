export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

type Ctx = { params: { id: string } }

export async function POST(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = params
    const body = await request.json()

    if (!body.author || !body.content) {
      return NextResponse.json({ message: '작성자와 댓글 내용은 필수입니다.' }, { status: 400 })
    }

    const result = await dbQuery(
      'INSERT INTO comments (post_id, author, content) VALUES ($1, $2, $3) RETURNING *',
      [id, body.author, body.content],
    )
    return NextResponse.json(
      { message: '댓글이 추가되었습니다.', comment: result.rows[0] },
      { status: 201 },
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts/[id]/comments POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
