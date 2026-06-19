export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

// Stripe 결제 세션 생성 (예시 - 실제 Stripe 연동 필요)
export async function POST(request: Request) {
  try {
    const { planId, priceId, userId } = await request.json()

    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, error: 'planId와 userId가 필요합니다.' },
        { status: 400 }
      )
    }

    // TODO: 실제 Stripe 연동
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // const session = await stripe.checkout.sessions.create({...})

    // 임시: Stripe 없이 직접 구독 생성 (개발용)
    // 프로덕션에서는 반드시 Stripe를 사용해야 합니다
    
    const planPrices: Record<string, number> = {
      premium_monthly: 9900,
      premium_yearly: 99000
    }

    const price = planPrices[planId]
    if (!price) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 플랜입니다.' },
        { status: 400 }
      )
    }

    // 개발 환경에서는 직접 구독 생성
    if (process.env.NODE_ENV === 'development') {
      const now = new Date()
      const periodEnd = new Date(now)
      if (planId === 'premium_monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      }

      // 기존 구독 취소
      await dbQuery(
        `UPDATE subscriptions
         SET status = 'canceled'
         WHERE user_id = $1 AND status = 'active'`,
        [userId]
      )

      // 새 구독 생성
      type SubscriptionRow = { id: string; [key: string]: unknown }
      const subscriptionResult = await dbQuery<SubscriptionRow>(
        `INSERT INTO subscriptions (
          user_id, plan_type, status, current_period_start, current_period_end
        ) VALUES ($1,$2,'active',$3,$4)
        RETURNING *`,
        [userId, planId, now.toISOString(), periodEnd.toISOString()]
      )
      const subscription = subscriptionResult.rows[0]

      // 결제 내역 기록
      await dbQuery(
        `INSERT INTO payments (user_id, subscription_id, amount, currency, status, description)
         VALUES ($1,$2,$3,'KRW','completed',$4)`,
        [userId, subscription.id, price, `${planId === 'premium_monthly' ? '월간' : '연간'} 프리미엄 구독`]
      )

      return NextResponse.json({
        success: true,
        subscription: subscription,
        message: '구독이 활성화되었습니다.'
      })
    }

    // 프로덕션 환경에서는 Stripe 사용
    return NextResponse.json(
      {
        success: false,
        error: 'Stripe 연동이 필요합니다. 환경 변수 STRIPE_SECRET_KEY를 설정해주세요.',
        message: '프로덕션 환경에서는 Stripe를 통한 결제가 필요합니다.'
      },
      { status: 501 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('결제 세션 생성 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: '결제 세션 생성 중 오류가 발생했습니다.',
        details: message
      },
      { status: 500 }
    )
  }
}

