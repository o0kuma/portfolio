import { dbQuery } from '@/lib/neon-server'

/** Delete non-featured cron posts older than 15 days, and keep only the most recent 100 cron posts. */
export async function cleanupOldCronPosts(): Promise<number> {
  try {
    // Step 1: delete cron posts older than 15 days
    const byAge = await dbQuery<{ id: string }>(
      `DELETE FROM posts
       WHERE created_at < NOW() - INTERVAL '15 days'
         AND featured = false
         AND source = 'cron'
       RETURNING id`,
    )

    // Step 2: prune non-featured cron posts beyond the 100 most recent
    const byCount = await dbQuery<{ id: string }>(
      `DELETE FROM posts
       WHERE id IN (
         SELECT id FROM posts
         WHERE source = 'cron'
           AND featured = false
         ORDER BY created_at DESC
         OFFSET 100
       )
       RETURNING id`,
    )

    return byAge.rows.length + byCount.rows.length
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('column') && msg.includes('source')) {
      console.warn('[cleanup] posts.source column missing — skip cleanup until migration runs')
      return 0
    }
    throw err
  }
}
