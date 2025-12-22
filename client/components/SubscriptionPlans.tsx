'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiZap, FiStar, FiArrowRight } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: 'monthly' | 'yearly'
  description: string
  features: string[]
  popular?: boolean
  stripePriceId?: string
}

const plans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '무료',
    price: 0,
    period: 'monthly',
    description: '기본 AI 기능을 제한적으로 사용',
    features: [
      '일일 10개 메시지',
      '기본 AI 챗봇',
      '텍스트 개선 5회/일',
      '번역 5회/일',
      '요약 3회/일'
    ]
  },
  {
    id: 'premium_monthly',
    name: '프리미엄 월간',
    price: 9900,
    period: 'monthly',
    description: '무제한 AI 기능과 고급 기능',
    popular: true,
    features: [
      '무제한 AI 메시지',
      '고급 AI 챗봇 (GPT-4)',
      '무제한 텍스트 개선',
      '무제한 번역',
      '무제한 요약',
      '우선 지원',
      '광고 없음'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly'
  },
  {
    id: 'premium_yearly',
    name: '프리미엄 연간',
    price: 99000,
    period: 'yearly',
    description: '연간 구독으로 17% 할인',
    features: [
      '무제한 AI 메시지',
      '고급 AI 챗봇 (GPT-4)',
      '무제한 텍스트 개선',
      '무제한 번역',
      '무제한 요약',
      '우선 지원',
      '광고 없음',
      '연간 17% 할인'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly'
  }
]

export default function SubscriptionPlans() {
  const [user, setUser] = useState<any>(null)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const response = await fetch(`/api/subscription/check?userId=${user.id}`)
        const data = await response.json()
        if (data.success) {
          setCurrentSubscription(data.subscription)
        }
      }
    } catch (error) {
      console.error('사용자 확인 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.id === 'free') return

    if (!user) {
      alert('로그인이 필요합니다.')
      // 로그인 페이지로 리다이렉트
      return
    }

    try {
      // Stripe 결제 세션 생성
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          priceId: plan.stripePriceId,
          userId: user.id
        })
      })

      const data = await response.json()
      
      if (data.success && data.url) {
        // Stripe Checkout으로 리다이렉트
        window.location.href = data.url
      } else {
        alert('결제 세션 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('구독 오류:', error)
      alert('구독 처리 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            프리미엄 구독 플랜
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            ChatGPT를 활용한 고급 AI 기능을 무제한으로 사용하세요
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentSubscription?.plan === plan.id
            const isPremium = currentSubscription?.isPremium

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <FiStar className="w-4 h-4" />
                      인기
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 dark:text-gray-400">
                        /{plan.period === 'monthly' ? '월' : '년'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 bg-green-500 text-white rounded-lg font-semibold cursor-not-allowed"
                  >
                    현재 플랜
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.id === 'free'
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white'
                    }`}
                  >
                    {plan.id === 'free' ? '현재 플랜' : '구독하기'}
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>

        {currentSubscription && currentSubscription.isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <FiStar className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                프리미엄 멤버십 활성화됨
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              구독 만료일: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('ko-KR')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

