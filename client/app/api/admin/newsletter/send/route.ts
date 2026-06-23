export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { ensureNewsletterSentColumn, sendNewsletterForPost } from '@/lib/newsletter-send'

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: 'postId가 필요합니다.' }, { status: 400 })
    }

    await ensureNewsletterSentColumn()

    const postResult = await dbQuery<{
      id: number
      title: string
      content: string
      status: string
    }>(`SELECT id, title, content, status FROM posts WHERE id = $1`, [postId])

    if (!postResult.rows[0]) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const post = postResult.rows[0]

    const subscribersResult = await dbQuery<{ email: string; unsubscribe_token: string }>(
      `SELECT email, unsubscribe_token FROM email_subscribers WHERE active = TRUE`,
    )

    if (subscribersResult.rows.length === 0) {
      return NextResponse.json({ success: true, message: '활성 구독자가 없습니다.', sent: 0 })
    }

    const result = await sendNewsletterForPost(post, subscribersResult.rows)

    if (result.sent === 0 && result.total > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '모든 구독자에게 발송하지 못했습니다.',
          sent: 0,
          total: result.total,
          errors: result.errors,
        },
        { status: 502 },
      )
    }

    if (result.failed > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '일부 구독자에게 발송하지 못했습니다. 게시글은 재시도 가능하도록 유지됩니다.',
          sent: result.sent,
          total: result.total,
          errors: result.errors,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      success: true,
      message: '뉴스레터 발송 완료',
      sent: result.sent,
      total: result.total,
    })
  } catch (error) {
    console.error('Admin newsletter send error:', error)
    return NextResponse.json({ success: false, error: '발송 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
