export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'

// 사용자의 구독 상태 확인
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'userId 또는 sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 세션 ID로 사용자 찾기 (익명 사용자 처리)
    let targetUserId = userId
    if (!targetUserId && sessionId) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('user_id')
        .eq('session_id', sessionId)
        .single()
      
      if (conversation && conversation.user_id !== 'anonymous') {
        targetUserId = conversation.user_id
      }
    }

    // 익명 사용자는 무료 플랜
    if (!targetUserId || targetUserId === 'anonymous') {
      return NextResponse.json({
        success: true,
        subscription: {
          plan: 'free',
          status: 'active',
          isPremium: false,
          limits: {
            dailyChatMessages: 10,
            dailyImprovements: 5,
            dailyTranslations: 5,
            dailySummaries: 3,
            dailySuggestions: 3
          }
        }
      })
    }

    // 활성 구독 확인
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('구독 조회 오류:', error)
    }

    const isPremium = subscription && subscription.current_period_end > new Date().toISOString()
    const plan = isPremium ? subscription.plan_type : 'free'

    // 일일 사용량 확인
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('usage_type, message_count')
      .eq('user_id', targetUserId)
      .eq('date', today)

    const usageMap: Record<string, number> = {}
    if (usage) {
      usage.forEach(u => {
        usageMap[u.usage_type] = (usageMap[u.usage_type] || 0) + u.message_count
      })
    }

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
    console.error('구독 확인 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: '구독 상태 확인 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}

