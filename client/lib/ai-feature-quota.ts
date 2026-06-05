import { NextResponse } from 'next/server'
import {
  applyAnonymousQuotaCookie,
  getAnonymousQuotaIdentity,
  type AnonymousQuotaIdentity,
} from '@/lib/anonymous-quota'

const INTERNAL_API_TIMEOUT_MS = 3000

export type AiFeatureUsageType = 'translate' | 'improve' | 'summarize'

const USAGE_LIMIT_KEYS: Record<AiFeatureUsageType, keyof FreeLimits> = {
  translate: 'dailyTranslations',
  improve: 'dailyImprovements',
  summarize: 'dailySummaries',
}

const USAGE_COUNT_KEYS: Record<AiFeatureUsageType, keyof FreeUsage> = {
  translate: 'translate',
  improve: 'improve',
  summarize: 'summarize',
}

type FreeLimits = {
  dailyChatMessages: number
  dailyImprovements: number
  dailyTranslations: number
  dailySummaries: number
  dailySuggestions: number
}

type FreeUsage = {
  chat: number
  improve: number
  translate: number
  summarize: number
  suggest: number
}

function getInternalApiBaseUrl(): string {
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (publicAppUrl) {
    return publicAppUrl.replace(/\/$/, '')
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    return vercelUrl.startsWith('http://') || vercelUrl.startsWith('https://')
      ? vercelUrl
      : `https://${vercelUrl}`
  }

  return 'http://localhost:3000'
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs: number = INTERNAL_API_TIMEOUT_MS,
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

export function quotaJson(
  identity: AnonymousQuotaIdentity,
  body: unknown,
  init?: ResponseInit,
): NextResponse {
  return applyAnonymousQuotaCookie(NextResponse.json(body, init), identity)
}

export async function enforceAiFeatureQuota(
  request: Request,
  usageType: AiFeatureUsageType,
): Promise<{ ok: true; identity: AnonymousQuotaIdentity } | { ok: false; response: NextResponse }> {
  const identity = getAnonymousQuotaIdentity(request)
  const base = getInternalApiBaseUrl()

  try {
    const params = new URLSearchParams({ sessionId: identity.sessionId })
    const check = await fetchWithTimeout(`${base}/api/subscription/check?${params}`)
    const contentType = check.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        response: quotaJson(
          identity,
          {
            success: false,
            error: '사용량 한도를 확인할 수 없어 요청을 처리할 수 없습니다.',
            errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE',
          },
          { status: 503 },
        ),
      }
    }

    const data = await check.json().catch(() => null)
    if (!check.ok || !data?.success || !data?.subscription) {
      return {
        ok: false,
        response: quotaJson(
          identity,
          {
            success: false,
            error: '사용량 한도를 확인할 수 없어 요청을 처리할 수 없습니다.',
            errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE',
          },
          { status: 503 },
        ),
      }
    }

    const { subscription } = data as {
      subscription: { isPremium: boolean; limits: FreeLimits; usage: FreeUsage }
    }

    if (!subscription.isPremium) {
      const limitKey = USAGE_LIMIT_KEYS[usageType]
      const usageKey = USAGE_COUNT_KEYS[usageType]
      const limit = subscription.limits[limitKey]
      const used = subscription.usage[usageKey] ?? 0

      if (used >= limit) {
        return {
          ok: false,
          response: quotaJson(
            identity,
            {
              success: false,
              error: '일일 무료 사용 한도를 초과했습니다.',
              errorCode: 'DAILY_LIMIT_EXCEEDED',
              limit,
              used,
              upgradeRequired: true,
            },
            { status: 403 },
          ),
        }
      }
    }

    return { ok: true, identity }
  } catch {
    return {
      ok: false,
      response: quotaJson(
        identity,
        {
          success: false,
          error: '사용량 한도를 확인할 수 없어 요청을 처리할 수 없습니다.',
          errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE',
        },
        { status: 503 },
      ),
    }
  }
}

export async function recordAiFeatureUsage(
  identity: AnonymousQuotaIdentity,
  usageType: AiFeatureUsageType,
  tokensUsed: number,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const base = getInternalApiBaseUrl()

  try {
    const usageResponse = await fetchWithTimeout(`${base}/api/subscription/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: null,
        sessionId: identity.sessionId,
        usageType,
        messageCount: 1,
        tokensUsed,
      }),
    })

    const contentType = usageResponse.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        response: quotaJson(
          identity,
          {
            success: false,
            error: '사용량을 기록할 수 없어 요청을 완료할 수 없습니다.',
            errorCode: 'USAGE_RECORD_UNAVAILABLE',
          },
          { status: 503 },
        ),
      }
    }

    const usageData = await usageResponse.json().catch(() => null)
    if (!usageResponse.ok || !usageData?.success) {
      return {
        ok: false,
        response: quotaJson(
          identity,
          {
            success: false,
            error: '사용량을 기록할 수 없어 요청을 완료할 수 없습니다.',
            errorCode: 'USAGE_RECORD_UNAVAILABLE',
          },
          { status: 503 },
        ),
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      response: quotaJson(
        identity,
        {
          success: false,
          error: '사용량을 기록할 수 없어 요청을 완료할 수 없습니다.',
          errorCode: 'USAGE_RECORD_UNAVAILABLE',
        },
        { status: 503 },
      ),
    }
  }
}

export function estimateTokensUsed(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4))
}
