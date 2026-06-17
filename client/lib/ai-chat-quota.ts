import { dbQuery } from '@/lib/neon-server'

/**
 * Direct-DB quota helpers for AI routes.
 *
 * AI endpoints previously re-entered the app over HTTP
 * (fetch → /api/subscription/check, /api/subscription/usage), which fails on
 * Vercel (self-fetch timeouts / deployment protection) and blocked responses
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

function isMissingAnonIndexError(error: any): boolean {
  const msg = error?.message || ''
  return (
    msg.includes('idx_ai_usage_anon_session_date_type') ||
    (msg.includes('no unique') && msg.includes('conflict'))
  )
}

/**
 * Atomically reserves one usage unit against the daily limit before calling Gemini.
 * Uses ON CONFLICT ... WHERE message_count < limit so concurrent requests cannot
 * all pass a separate read-then-write quota check.
 */
export async function reserveAnonymousAiQuota(
  quotaSessionId: string,
  usageType: AnonymousUsageType,
): Promise<AnonymousQuotaStatus> {
  const limit = FREE_LIMITS[USAGE_TYPE_TO_LIMIT_KEY[usageType]]
  const date = today()
  try {
    try {
      const reserved = await dbQuery<{ message_count: number }>(
        `INSERT INTO ai_usage (user_id, session_id, usage_type, message_count, tokens_used, date)
         VALUES (NULL, $1, $2, 1, 0, $3)
         ON CONFLICT (session_id, date, usage_type) WHERE user_id IS NULL AND session_id IS NOT NULL
         DO UPDATE SET
           message_count = ai_usage.message_count + EXCLUDED.message_count
         WHERE ai_usage.message_count < $4
         RETURNING message_count`,
        [quotaSessionId, usageType, date, limit],
      )
      if (reserved.rows[0]) {
        const used = reserved.rows[0].message_count || 0
        return { ok: true, used, limit, exceeded: used > limit }
      }

      const current = await checkAnonymousAiQuota(quotaSessionId, usageType)
      return { ok: true, used: current.used, limit, exceeded: true }
    } catch (upsertError: any) {
      if (!isMissingAnonIndexError(upsertError)) throw upsertError

      const current = await checkAnonymousAiQuota(quotaSessionId, usageType)
      if (!current.ok) return current
      if (current.exceeded) return current

      const recorded = await recordAnonymousUsage(quotaSessionId, usageType, 1, 0)
      if (!recorded) {
        return { ok: false, used: current.used, limit, exceeded: false }
      }

      const used = current.used + 1
      return { ok: true, used, limit, exceeded: used > limit }
    }
  } catch (error: any) {
    console.error(`reserveAnonymousAiQuota(${usageType}) failed:`, error?.message || error)
    return { ok: false, used: 0, limit, exceeded: false }
  }
}

/** Atomically reserves one chat message against the daily limit before calling Gemini. */
export async function reserveAnonymousChatQuota(quotaSessionId: string): Promise<AnonymousQuotaStatus> {
  return reserveAnonymousAiQuota(quotaSessionId, 'chat')
}

/** Best-effort token tally after a reserved usage unit completes. */
export async function addAnonymousAiTokens(
  quotaSessionId: string,
  usageType: AnonymousUsageType,
  tokensUsed: number,
): Promise<void> {
  if (!Number.isFinite(tokensUsed) || tokensUsed <= 0) return
  const date = today()
  try {
    await dbQuery(
      `UPDATE ai_usage
       SET tokens_used = tokens_used + $4
       WHERE session_id = $1 AND date = $2 AND usage_type = $3 AND user_id IS NULL`,
      [quotaSessionId, date, usageType, tokensUsed],
    )
  } catch (error: any) {
    console.warn(`addAnonymousAiTokens(${usageType}) failed:`, error?.message || error)
  }
}

/** Best-effort token tally after a reserved chat message completes. */
export async function addAnonymousChatTokens(quotaSessionId: string, tokensUsed: number): Promise<void> {
  return addAnonymousAiTokens(quotaSessionId, 'chat', tokensUsed)
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
      if (!isMissingAnonIndexError(upsertError)) throw upsertError

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
