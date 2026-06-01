import { dbQuery } from '@/lib/neon-server'

/** Delete non-featured cron posts older than 15 days. */
export async function cleanupOldCronPosts(): Promise<number> {
  try {
    const result = await dbQuery<{ id: string }>(
      `DELETE FROM posts
       WHERE created_at < NOW() - INTERVAL '15 days'
         AND featured = false
         AND source = 'cron'
       RETURNING id`,
    )
    return result.rows.length
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('column') && msg.includes('source')) {
      console.warn('[cleanup] posts.source column missing — skip cleanup until migration runs')
      return 0
    }
    throw err
  }
}
