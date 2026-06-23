export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { sendNewsletterEmail } from '@/lib/newsletter-email'

// Ensure newsletter_sent column exists
async function ensureNewsletterSentColumn() {
  await dbQuery(
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS newsletter_sent BOOLEAN DEFAULT FALSE`
  )
}

export async function GET(request: NextRequest) {
  // Simple auth: must provide CRON_SECRET header or be from Vercel cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureNewsletterSentColumn()

    // Find posts published in the last 24h that haven't been newsletter-sent
    const postsResult = await dbQuery<{
      id: number
      title: string
      content: string
      slug: string
    }>(
      `SELECT id, title, content, slug
       FROM posts
       WHERE status = 'published'
         AND newsletter_sent = FALSE
         AND created_at >= NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC`
    )

    if (postsResult.rows.length === 0) {
      return NextResponse.json({ success: true, message: '발송할 새 글이 없습니다.', sent: 0 })
    }

    // Fetch active subscribers
    const subscribersResult = await dbQuery<{ email: string; unsubscribe_token: string }>(
      `SELECT email, unsubscribe_token FROM email_subscribers WHERE active = TRUE`
    )

    if (subscribersResult.rows.length === 0) {
      return NextResponse.json({ success: true, message: '활성 구독자가 없습니다.', sent: 0 })
    }

    let totalSent = 0

    for (const post of postsResult.rows) {
      const excerpt = post.content.replace(/[#*`>\[\]]/g, '').substring(0, 150)
      const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kuuuma.com'}/posts/${post.id}`

      for (const subscriber of subscribersResult.rows) {
        try {
          await sendNewsletterEmail({
            to: subscriber.email,
            title: post.title,
            excerpt,
            postUrl,
            unsubscribeToken: subscriber.unsubscribe_token,
          })
          totalSent++
        } catch (err) {
          console.error(`뉴스레터 발송 실패 (${subscriber.email}):`, err)
        }
      }

      // Mark as sent
      await dbQuery(`UPDATE posts SET newsletter_sent = TRUE WHERE id = $1`, [post.id])
    }

    return NextResponse.json({
      success: true,
      message: `뉴스레터 발송 완료`,
      posts: postsResult.rows.length,
      sent: totalSent,
    })
  } catch (error) {
    console.error('Newsletter cron error:', error)
    return NextResponse.json({ success: false, error: '뉴스레터 발송 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
