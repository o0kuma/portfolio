import { dbQuery } from '@/lib/neon-server'
import { sendNewsletterEmail } from '@/lib/newsletter-email'

export type NewsletterPost = {
  id: number
  title: string
  content: string
}

export type NewsletterSubscriber = {
  email: string
  unsubscribe_token: string
}

export type NewsletterSendResult = {
  sent: number
  failed: number
  total: number
  errors: string[]
}

export async function ensureNewsletterSentColumn(): Promise<void> {
  await dbQuery(
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS newsletter_sent BOOLEAN DEFAULT FALSE`,
  )
}

function buildPostUrl(postId: number): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kuuuma.com'}/posts/${postId}`
}

function buildExcerpt(content: string): string {
  return content.replace(/[#*`>\[\]]/g, '').substring(0, 150)
}

/** Send one post to all subscribers. Marks the post only when every send succeeds. */
export async function sendNewsletterForPost(
  post: NewsletterPost,
  subscribers: NewsletterSubscriber[],
): Promise<NewsletterSendResult> {
  const excerpt = buildExcerpt(post.content)
  const postUrl = buildPostUrl(post.id)
  const errors: string[] = []
  let sent = 0

  for (const subscriber of subscribers) {
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
      console.error(`뉴스레터 발송 실패 (${subscriber.email}):`, err)
    }
  }

  const total = subscribers.length
  if (total > 0 && sent === total) {
    await dbQuery(`UPDATE posts SET newsletter_sent = TRUE WHERE id = $1`, [post.id])
  }

  return { sent, failed: total - sent, total, errors }
}

export type NewsletterCronResult = {
  postsProcessed: number
  sent: number
  failed: number
  postResults: Array<{ postId: number; sent: number; failed: number; total: number }>
}

/** Find recent unpublished-to-newsletter posts and send to all active subscribers. */
export async function runNewsletterCron(): Promise<NewsletterCronResult> {
  await ensureNewsletterSentColumn()

  const postsResult = await dbQuery<NewsletterPost>(
    `SELECT id, title, content
     FROM posts
     WHERE status = 'published'
       AND newsletter_sent = FALSE
       AND created_at >= NOW() - INTERVAL '24 hours'
     ORDER BY created_at DESC`,
  )

  const subscribersResult = await dbQuery<NewsletterSubscriber>(
    `SELECT email, unsubscribe_token FROM email_subscribers WHERE active = TRUE`,
  )

  const subscribers = subscribersResult.rows
  const postResults: NewsletterCronResult['postResults'] = []
  let sent = 0
  let failed = 0

  for (const post of postsResult.rows) {
    if (subscribers.length === 0) break

    const result = await sendNewsletterForPost(post, subscribers)
    sent += result.sent
    failed += result.failed
    postResults.push({
      postId: post.id,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    })
  }

  return {
    postsProcessed: postResults.length,
    sent,
    failed,
    postResults,
  }
}
