export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { generatePostSummary } from '@/lib/post-summary'

type Ctx = { params: { id: string } }

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = params

    await dbQuery(
      `CREATE TABLE IF NOT EXISTS post_summaries (
        post_id VARCHAR(255) PRIMARY KEY,
        summary TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      []
    )

    const cached = await dbQuery(
      'SELECT summary FROM post_summaries WHERE post_id = $1',
      [id]
    )

    if (cached.rows.length > 0) {
      return NextResponse.json({ summary: cached.rows[0].summary, cached: true })
    }

    const postResult = await dbQuery('SELECT content FROM posts WHERE id = $1', [id])
    if (postResult.rows.length === 0) {
      return NextResponse.json({ message: '포스트를 찾을 수 없습니다.' }, { status: 404 })
    }

    const content = postResult.rows[0].content as string
    const summary = await generatePostSummary(content)

    if (!summary) {
      return NextResponse.json({ message: 'AI 요약을 생성할 수 없습니다.' }, { status: 503 })
    }

    await dbQuery(
      `INSERT INTO post_summaries (post_id, summary) VALUES ($1, $2)
       ON CONFLICT (post_id) DO UPDATE SET summary = $2, created_at = NOW()`,
      [id, summary]
    )

    return NextResponse.json({ summary, cached: false })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts/[id]/summary GET]', msg)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
