import { NextResponse } from 'next/server'
import {
  applyAnonymousQuotaCookie,
  getAnonymousQuotaIdentity,
  type AnonymousQuotaIdentity
} from '@/lib/anonymous-quota'

export const MAX_AI_TEXT_LENGTH = 4000
const INTERNAL_API_TIMEOUT_MS = 3000

export type AiUsageType = 'improve' | 'translate' | 'summarize'

const USAGE_LIMIT_KEYS: Record<AiUsageType, { usageKey: string; limitKey: string }> = {
  improve: { usageKey: 'improve', limitKey: 'dailyImprovements' },
  translate: { usageKey: 'translate', limitKey: 'dailyTranslations' },
  summarize: { usageKey: 'summarize', limitKey: 'dailySummaries' }
}

export interface QuotaGuardContext {
  quotaIdentity: AnonymousQuotaIdentity
  quotaJson: (body: unknown, init?: ResponseInit) => NextResponse
}

function getInternalApiBaseUrl(): string {
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
  timeoutMs: number = INTERNAL_API_TIMEOUT_MS
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

function createQuotaContext(request: Request): QuotaGuardContext {
  const quotaIdentity = getAnonymousQuotaIdentity(request)
  return {
    quotaIdentity,
    quotaJson: (body: unknown, init?: ResponseInit) =>
      applyAnonymousQuotaCookie(NextResponse.json(body, init), quotaIdentity)
  }
}

export async function enforceAiQuota(
  request: Request,
  usageType: AiUsageType
): Promise<{ allowed: true; ctx: QuotaGuardContext } | { allowed: false; response: NextResponse }> {
  const ctx = createQuotaContext(request)
  const { usageKey, limitKey } = USAGE_LIMIT_KEYS[usageType]
  const internalApiBaseUrl = getInternalApiBaseUrl()

  try {
    const subscriptionParams = new URLSearchParams({
      sessionId: ctx.quotaIdentity.sessionId
    })
    const subscriptionCheck = await fetchWithTimeout(
      `${internalApiBaseUrl}/api/subscription/check?${subscriptionParams}`
    )

    const contentType = subscriptionCheck.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return {
        allowed: false,
        response: ctx.quotaJson(
          {
            success: false,
            error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
            errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE'
          },
          { status: 503 }
        )
      }
    }

    const subscriptionData = await subscriptionCheck.json().catch(() => null)
    if (!subscriptionCheck.ok || !subscriptionData?.success || !subscriptionData?.subscription) {
      return {
        allowed: false,
        response: ctx.quotaJson(
          {
            success: false,
            error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
            errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE'
          },
          { status: 503 }
        )
      }
    }

    const { subscription: sub } = subscriptionData
    const used = sub.usage?.[usageKey] ?? 0
    const limit = sub.limits?.[limitKey] ?? 0

    if (!sub.isPremium && used >= limit) {
      return {
        allowed: false,
        response: ctx.quotaJson(
          {
            success: false,
            error: '일일 무료 사용 한도를 초과했습니다.',
            errorCode: 'DAILY_LIMIT_EXCEEDED',
            limit,
            used,
            upgradeRequired: true
          },
          { status: 403 }
        )
      }
    }

    return { allowed: true, ctx }
  } catch {
    return {
      allowed: false,
      response: ctx.quotaJson(
        {
          success: false,
          error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
          errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE'
        },
        { status: 503 }
      )
    }
  }
}

export async function recordAiUsage(
  ctx: QuotaGuardContext,
  usageType: AiUsageType,
  tokensUsed = 0
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const internalApiBaseUrl = getInternalApiBaseUrl()

  try {
    const usageResponse = await fetchWithTimeout(`${internalApiBaseUrl}/api/subscription/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: null,
        sessionId: ctx.quotaIdentity.sessionId,
        usageType,
        messageCount: 1,
        tokensUsed
      })
    })

    const usageContentType = usageResponse.headers.get('content-type') || ''
    if (!usageContentType.includes('application/json')) {
      return {
        ok: false,
        response: ctx.quotaJson(
          {
            success: false,
            error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
            errorCode: 'USAGE_RECORD_UNAVAILABLE'
          },
          { status: 503 }
        )
      }
    }

    const usageData = await usageResponse.json().catch(() => null)
    if (!usageResponse.ok || !usageData?.success) {
      return {
        ok: false,
        response: ctx.quotaJson(
          {
            success: false,
            error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
            errorCode: 'USAGE_RECORD_UNAVAILABLE'
          },
          { status: 503 }
        )
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      response: ctx.quotaJson(
        {
          success: false,
          error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
          errorCode: 'USAGE_RECORD_UNAVAILABLE'
        },
        { status: 503 }
      )
    }
  }
}
