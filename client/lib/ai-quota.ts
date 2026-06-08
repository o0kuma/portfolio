import { NextResponse } from 'next/server'
import {
  AnonymousQuotaIdentity,
  applyAnonymousQuotaCookie,
  getAnonymousQuotaIdentity,
} from '@/lib/anonymous-quota'

const INTERNAL_API_TIMEOUT_MS = 3000

export type AiUsageType = 'chat' | 'improve' | 'translate' | 'summarize' | 'suggest'

const USAGE_TO_LIMIT_KEY: Record<AiUsageType, string> = {
  chat: 'dailyChatMessages',
  improve: 'dailyImprovements',
  translate: 'dailyTranslations',
  summarize: 'dailySummaries',
  suggest: 'dailySuggestions',
}

const USAGE_TO_COUNT_KEY: Record<AiUsageType, string> = {
  chat: 'chat',
  improve: 'improve',
  translate: 'translate',
  summarize: 'summarize',
  suggest: 'suggest',
}

export function getInternalApiBaseUrl(): string {
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (publicAppUrl) {
    return publicAppUrl
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

function quotaJson(
  body: Record<string, unknown>,
  quotaIdentity: AnonymousQuotaIdentity,
  init?: ResponseInit,
) {
  return applyAnonymousQuotaCookie(NextResponse.json(body, init), quotaIdentity)
}

export type QuotaCheckSuccess = {
  ok: true
  quotaIdentity: AnonymousQuotaIdentity
  subscription: {
    isPremium: boolean
    limits: Record<string, number>
    usage: Record<string, number>
  }
}

export type QuotaCheckFailure = {
  ok: false
  response: NextResponse
}

export async function checkAiQuota(
  request: Request,
  usageType: AiUsageType,
): Promise<QuotaCheckSuccess | QuotaCheckFailure> {
  const quotaIdentity = getAnonymousQuotaIdentity(request)
  const internalApiBaseUrl = getInternalApiBaseUrl()
  const limitKey = USAGE_TO_LIMIT_KEY[usageType]
  const countKey = USAGE_TO_COUNT_KEY[usageType]

  try {
    const subscriptionParams = new URLSearchParams({
      sessionId: quotaIdentity.sessionId,
    })
    const subscriptionCheck = await fetchWithTimeout(
      `${internalApiBaseUrl}/api/subscription/check?${subscriptionParams}`,
    )

    const contentType = subscriptionCheck.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        response: quotaJson(
          {
            success: false,
            error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
            errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE',
          },
          quotaIdentity,
          { status: 503 },
        ),
      }
    }

    const subscriptionData = await subscriptionCheck.json().catch(() => null)
    if (!subscriptionCheck.ok || !subscriptionData?.success || !subscriptionData?.subscription) {
      return {
        ok: false,
        response: quotaJson(
          {
            success: false,
            error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
            errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE',
          },
          quotaIdentity,
          { status: 503 },
        ),
      }
    }

    const { subscription: sub } = subscriptionData
    const { usage, limits } = sub

    if (!sub.isPremium && (usage[countKey] ?? 0) >= (limits[limitKey] ?? 0)) {
      return {
        ok: false,
        response: quotaJson(
          {
            success: false,
            error: '일일 무료 사용 한도를 초과했습니다.',
            errorCode: 'DAILY_LIMIT_EXCEEDED',
            limit: limits[limitKey],
            used: usage[countKey] ?? 0,
            upgradeRequired: true,
          },
          quotaIdentity,
          { status: 403 },
        ),
      }
    }

    return {
      ok: true,
      quotaIdentity,
      subscription: sub,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown'
    console.error('AI quota check failed:', message)
    return {
      ok: false,
      response: quotaJson(
        {
          success: false,
          error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
          errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE',
        },
        quotaIdentity,
        { status: 503 },
      ),
    }
  }
}

export type UsageRecordSuccess = { ok: true }
export type UsageRecordFailure = { ok: false; response: NextResponse }

export async function recordAiUsage(
  request: Request,
  usageType: AiUsageType,
  quotaIdentity: AnonymousQuotaIdentity,
  tokensUsed = 0,
): Promise<UsageRecordSuccess | UsageRecordFailure> {
  const internalApiBaseUrl = getInternalApiBaseUrl()

  try {
    const usageResponse = await fetchWithTimeout(`${internalApiBaseUrl}/api/subscription/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: null,
        sessionId: quotaIdentity.sessionId,
        usageType,
        messageCount: 1,
        tokensUsed,
      }),
    })

    const usageContentType = usageResponse.headers.get('content-type') || ''
    if (!usageContentType.includes('application/json')) {
      return {
        ok: false,
        response: quotaJson(
          {
            success: false,
            error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
            errorCode: 'USAGE_RECORD_UNAVAILABLE',
          },
          quotaIdentity,
          { status: 503 },
        ),
      }
    }

    const usageData = await usageResponse.json().catch(() => null)
    if (!usageResponse.ok || !usageData?.success) {
      return {
        ok: false,
        response: quotaJson(
          {
            success: false,
            error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
            errorCode: 'USAGE_RECORD_UNAVAILABLE',
          },
          quotaIdentity,
          { status: 503 },
        ),
      }
    }

    return { ok: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown'
    console.error('AI usage record failed:', message)
    return {
      ok: false,
      response: quotaJson(
        {
          success: false,
          error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
          errorCode: 'USAGE_RECORD_UNAVAILABLE',
        },
        quotaIdentity,
        { status: 503 },
      ),
    }
  }
}

export function applyQuotaCookieToResponse(
  response: NextResponse,
  quotaIdentity: AnonymousQuotaIdentity,
): NextResponse {
  return applyAnonymousQuotaCookie(response, quotaIdentity)
}
