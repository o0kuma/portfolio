export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

type Ctx = { params: { id: string } }

export async function POST(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = params

    const postResult = await dbQuery('SELECT likes FROM posts WHERE id = $1 LIMIT 1', [id])
    if (!postResult.rows[0]) {
      return NextResponse.json({ message: '포스트를 찾을 수 없습니다.' }, { status: 404 })
    }

    const updated = await dbQuery(
      'UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes',
      [id],
    )
    return NextResponse.json({ message: '좋아요가 추가되었습니다.', likes: updated.rows[0]?.likes })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts/[id]/like POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
