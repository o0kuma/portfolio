export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { sendNewsletterEmail } from '@/lib/newsletter-email'

async function ensureNewsletterSentColumn() {
  await dbQuery(
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS newsletter_sent BOOLEAN DEFAULT FALSE`
  )
}

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

    // Fetch the post
    const postResult = await dbQuery<{
      id: number
      title: string
      content: string
      slug: string
      status: string
    }>(
      `SELECT id, title, content, slug, status FROM posts WHERE id = $1`,
      [postId]
    )

    if (!postResult.rows[0]) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const post = postResult.rows[0]
    const excerpt = post.content.replace(/[#*`>\[\]]/g, '').substring(0, 150)
    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kuuuma.com'}/posts/${post.id}`

    // Fetch active subscribers
    const subscribersResult = await dbQuery<{ email: string; unsubscribe_token: string }>(
      `SELECT email, unsubscribe_token FROM email_subscribers WHERE active = TRUE`
    )

    if (subscribersResult.rows.length === 0) {
      return NextResponse.json({ success: true, message: '활성 구독자가 없습니다.', sent: 0 })
    }

    let sent = 0
    const errors: string[] = []

    for (const subscriber of subscribersResult.rows) {
      try {
        await sendNewsletterEmail({
          to: subscriber.email,
          title: post.title,
          excerpt,
          postUrl,
          unsubscribeToken: subscriber.unsubscribe_token,
        })
        sent++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${subscriber.email}: ${msg}`)
      }
    }

    // Mark post as newsletter_sent
    await dbQuery(`UPDATE posts SET newsletter_sent = TRUE WHERE id = $1`, [post.id])

    return NextResponse.json({
      success: true,
      message: `뉴스레터 발송 완료`,
      sent,
      total: subscribersResult.rows.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Admin newsletter send error:', error)
    return NextResponse.json({ success: false, error: '발송 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
