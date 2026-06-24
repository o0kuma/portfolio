export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { runNewsletterCron } from '@/lib/newsletter-send'

/** Admin-authenticated manual trigger for the newsletter cron job. */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const result = await runNewsletterCron()

    if (result.postsProcessed === 0) {
      return NextResponse.json({
        success: true,
        message: '발송할 새 글이 없습니다.',
        sent: 0,
      })
    }

    if (result.sent === 0 && result.failed > 0) {
      return NextResponse.json(
        {
          success: false,
          message: '뉴스레터 발송에 실패했습니다. 게시글은 재시도 가능하도록 유지됩니다.',
          posts: result.postsProcessed,
          sent: 0,
          failed: result.failed,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      success: true,
      message: '뉴스레터 발송 완료',
      posts: result.postsProcessed,
      sent: result.sent,
      failed: result.failed,
    })
  } catch (error) {
    console.error('Admin newsletter run error:', error)
    return NextResponse.json(
      { success: false, error: '뉴스레터 발송 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
