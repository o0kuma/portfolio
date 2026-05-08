export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

const IDENTIFIER_PATTERN = /^[a-zA-Z0-9._:-]{1,128}$/

function toSafeIdentifier(value: string | null): string | null {
  const normalized = value?.trim()
  if (!normalized) return null
  if (!IDENTIFIER_PATTERN.test(normalized)) return null
  return normalized
}

function buildFreeSubscription(usageMap: Record<string, number>) {
  return {
    plan: 'free',
    status: 'active',
    isPremium: false,
    limits: {
      dailyChatMessages: 10,
      dailyImprovements: 5,
      dailyTranslations: 5,
      dailySummaries: 3,
      dailySuggestions: 3
    },
    usage: {
      chat: usageMap.chat || 0,
      improve: usageMap.improve || 0,
      translate: usageMap.translate || 0,
      summarize: usageMap.summarize || 0,
      suggest: usageMap.suggest || 0
    }
  }
}

// 사용자의 구독 상태 확인
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = toSafeIdentifier(searchParams.get('userId'))
    const sessionId = toSafeIdentifier(searchParams.get('sessionId'))

    if (!userId && !sessionId && (searchParams.get('userId') || searchParams.get('sessionId'))) {
      return NextResponse.json(
        { success: false, error: 'userId 또는 sessionId 형식이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'userId 또는 sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 세션 ID로 사용자 찾기 (익명 사용자 처리)
    let targetUserId = userId
    if (!targetUserId && sessionId) {
      try {
        const conversationResult = await dbQuery<{ user_id: string }>(
          'SELECT user_id FROM conversations WHERE session_id = $1 LIMIT 1',
          [sessionId]
        )
        const conversation = conversationResult.rows[0]

        if (conversation && conversation.user_id !== 'anonymous') {
          targetUserId = conversation.user_id
        }
      } catch (error: any) {
        console.error('subscription/check conversation lookup failed:', {
          code: error?.code,
          message: error?.message
        })
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const usageMap: Record<string, number> = {}

    try {
      if (targetUserId && targetUserId !== 'anonymous') {
        // Load today's usage for authenticated users.
        const usageResult = await dbQuery<{ usage_type: string; message_count: number }>(
          'SELECT usage_type, message_count FROM ai_usage WHERE user_id = $1 AND date = $2',
          [targetUserId, today]
        )

        usageResult.rows.forEach(u => {
          usageMap[u.usage_type] = (usageMap[u.usage_type] || 0) + u.message_count
        })
      } else if (sessionId) {
        // Anonymous users are limited by session_id because they do not have user_id.
        const usageResult = await dbQuery<{ usage_type: string; message_count: number }>(
          'SELECT usage_type, message_count FROM ai_usage WHERE session_id = $1 AND date = $2',
          [sessionId, today]
        )

        usageResult.rows.forEach(u => {
          usageMap[u.usage_type] = (usageMap[u.usage_type] || 0) + u.message_count
        })
      }
    } catch (error: any) {
      console.error('subscription/check usage lookup failed:', {
        code: error?.code,
        message: error?.message
      })
    }

    // 익명 사용자는 무료 플랜
    if (!targetUserId || targetUserId === 'anonymous') {
      return NextResponse.json({
        success: true,
        subscription: buildFreeSubscription(usageMap)
      })
    }

    // 활성 구독 확인
    let subscription: any = null
    try {
      const subscriptionResult = await dbQuery<any>(
        `SELECT * FROM subscriptions
         WHERE user_id = $1 AND status = 'active' AND current_period_end > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [targetUserId]
      )
      subscription = subscriptionResult.rows[0]
    } catch (error: any) {
      console.error('subscription/check subscription lookup failed:', {
        code: error?.code,
        message: error?.message,
        hasUserId: Boolean(targetUserId)
      })
    }

    const isPremium = subscription && subscription.current_period_end > new Date().toISOString()
    const plan = isPremium ? subscription.plan_type : 'free'

    // 플랜별 제한 설정
    const limits = isPremium ? {
      dailyChatMessages: 1000, // 프리미엄: 무제한 (1000으로 표시)
      dailyImprovements: 100,
      dailyTranslations: 100,
      dailySummaries: 50,
      dailySuggestions: 50
    } : {
      dailyChatMessages: 10,
      dailyImprovements: 5,
      dailyTranslations: 5,
      dailySummaries: 3,
      dailySuggestions: 3
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan,
        status: isPremium ? subscription.status : 'active',
        isPremium,
        currentPeriodEnd: isPremium ? subscription.current_period_end : null,
        limits,
        usage: {
          chat: usageMap.chat || 0,
          improve: usageMap.improve || 0,
          translate: usageMap.translate || 0,
          summarize: usageMap.summarize || 0,
          suggest: usageMap.suggest || 0
        }
      }
    })
  } catch (error: any) {
    console.error('subscription/check unexpected error:', {
      code: error?.code,
      message: error?.message
    })
    return NextResponse.json(
      {
        success: false,
        error: '구독 상태 확인 중 오류가 발생했습니다.',
        errorCode: 'SUBSCRIPTION_CHECK_ERROR'
      },
      { status: 500 }
    )
  }
}

