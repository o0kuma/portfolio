import { dbQuery } from '@/lib/neon-server'

/**
 * Direct-DB quota helpers for the AI chat route.
 *
 * The chat endpoint previously re-entered the app over HTTP
 * (fetch → /api/subscription/check, /api/subscription/usage), which fails on
 * Vercel (self-fetch timeouts / deployment protection) and blocked all chat
 * with 503. These helpers run the same queries in-process instead.
 */

export const FREE_LIMITS = {
  dailyChatMessages: 10,
  dailyImprovements: 5,
  dailyTranslations: 5,
  dailySummaries: 3,
  dailySuggestions: 3,
} as const

export type AnonymousUsageType = 'chat' | 'improve' | 'translate' | 'summarize' | 'suggest'

const USAGE_TYPE_TO_LIMIT_KEY: Record<AnonymousUsageType, keyof typeof FREE_LIMITS> = {
  chat: 'dailyChatMessages',
  improve: 'dailyImprovements',
  translate: 'dailyTranslations',
  summarize: 'dailySummaries',
  suggest: 'dailySuggestions',
}

export interface AnonymousQuotaStatus {
  ok: boolean
  used: number
  limit: number
  exceeded: boolean
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

/** Returns today's usage for an anonymous quota session and usage type. */
export async function checkAnonymousAiQuota(
  quotaSessionId: string,
  usageType: AnonymousUsageType,
): Promise<AnonymousQuotaStatus> {
  const limit = FREE_LIMITS[USAGE_TYPE_TO_LIMIT_KEY[usageType]]
  try {
    const result = await dbQuery<{ message_count: number }>(
      `SELECT message_count FROM ai_usage
       WHERE session_id = $1 AND date = $2 AND usage_type = $3 AND user_id IS NULL`,
      [quotaSessionId, today(), usageType],
    )
    const used = result.rows.reduce((sum, row) => sum + (row.message_count || 0), 0)
    return { ok: true, used, limit, exceeded: used >= limit }
  } catch (error: any) {
    console.error(`checkAnonymousAiQuota(${usageType}) failed:`, error?.message || error)
    return { ok: false, used: 0, limit, exceeded: false }
  }
}

/** Returns today's chat usage for an anonymous quota session. */
export async function checkAnonymousChatQuota(quotaSessionId: string): Promise<AnonymousQuotaStatus> {
  return checkAnonymousAiQuota(quotaSessionId, 'chat')
}

/** Upserts today's usage row for an anonymous quota session. */
export async function recordAnonymousUsage(
  quotaSessionId: string,
  usageType: AnonymousUsageType,
  messageCount: number,
  tokensUsed: number,
): Promise<boolean> {
  const date = today()
  try {
    try {
      await dbQuery(
        `INSERT INTO ai_usage (user_id, session_id, usage_type, message_count, tokens_used, date)
         VALUES (NULL, $1, $2, $3, $4, $5)
         ON CONFLICT (session_id, date, usage_type) WHERE user_id IS NULL AND session_id IS NOT NULL
         DO UPDATE SET
           message_count = ai_usage.message_count + EXCLUDED.message_count,
           tokens_used = ai_usage.tokens_used + EXCLUDED.tokens_used`,
        [quotaSessionId, usageType, messageCount, tokensUsed, date],
      )
      return true
    } catch (upsertError: any) {
      const msg = upsertError?.message || ''
      const missingAnonIndex =
        msg.includes('idx_ai_usage_anon_session_date_type') ||
        (msg.includes('no unique') && msg.includes('conflict'))
      if (!missingAnonIndex) throw upsertError

      const updated = await dbQuery<any>(
        `UPDATE ai_usage
         SET message_count = message_count + $4,
             tokens_used = tokens_used + $5
         WHERE session_id = $1 AND date = $2 AND usage_type = $3 AND user_id IS NULL
         RETURNING id`,
        [quotaSessionId, date, usageType, messageCount, tokensUsed],
      )
      if (!updated.rows[0]) {
        await dbQuery(
          `INSERT INTO ai_usage (user_id, session_id, usage_type, message_count, tokens_used, date)
           VALUES (NULL, $1, $2, $3, $4, $5)`,
          [quotaSessionId, usageType, messageCount, tokensUsed, date],
        )
      }
      return true
    }
  } catch (error: any) {
    console.error('recordAnonymousUsage failed:', error?.message || error)
    return false
  }
}
