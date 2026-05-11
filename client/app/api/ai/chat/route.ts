export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { applyAnonymousQuotaCookie, getAnonymousQuotaIdentity } from '@/lib/anonymous-quota'
import * as fs from 'fs'
import * as path from 'path'

const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash-preview-05-20'
const MAX_MESSAGE_LENGTH = 4000
const INTERNAL_API_TIMEOUT_MS = 3000

type FallbackReason = 'missing_api_key' | `gemini_http_${number}` | 'gemini_fetch_error' | null

async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs: number = INTERNAL_API_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

// Gemini API 키를 가져오는 헬퍼 함수
function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (key && key.length >= 10) {
    return key
  }
  return null
}

// server/.env 파일에서 GEMINI_API_KEY 로드 (개발 환경 전용)
function loadServerEnv() {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return
  }

  try {
    const serverDir = path.join(process.cwd(), '..', 'server')
    const envPaths = [
      path.join(serverDir, '.env'),
      path.join(serverDir, 'env.example'),
      path.join(serverDir, '.env.example')
    ]

    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8')
        envFile.split('\n').forEach(line => {
          const trimmedLine = line.trim()
          if (trimmedLine && !trimmedLine.startsWith('#')) {
            const match = trimmedLine.match(/^([^=:#]+)=(.*)$/)
            if (match) {
              const key = match[1].trim()
              const value = match[2].trim().replace(/^["']|["']$/g, '')
              if (key === 'GEMINI_API_KEY' && value && !process.env.GEMINI_API_KEY) {
                process.env.GEMINI_API_KEY = value
                return
              }
            }
          }
        })
        if (process.env.GEMINI_API_KEY) break
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('server 환경 변수 파일 로드 실패:', error)
    }
  }
}

loadServerEnv()

// Google Gemini API를 사용한 AI 응답 생성
async function generateAIResponse(
  message: string,
  tone: string = '친근하게',
  context: string = 'portfolio',
  conversationHistory: any[] = []
): Promise<{
  success: boolean
  response: string
  emotion: string
  intent: string
  confidence: number
  fallbackReason: FallbackReason
}> {
  // 개발 환경에서 .env 파일 재로드 시도
  if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    loadServerEnv()
  }

  const geminiApiKey = getGeminiApiKey()

  if (!geminiApiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ GEMINI_API_KEY가 설정되지 않았습니다. 기본 응답을 사용합니다.')
    }
    return generateFallbackResponse(message, tone, 'missing_api_key')
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Gemini API 키 확인됨 (길이:', geminiApiKey.length, ')')
  }

  try {
    const systemPrompt = context === 'blog'
      ? `You are a helpful assistant for a blog website called "iykyk blog". The blog covers topics like Tech, Economy, Coin, Travel, Food, and Lottery. Always respond in Korean. Respond in a ${tone} tone. Keep responses concise and helpful.`
      : `You are a helpful assistant for a portfolio website. The portfolio showcases web development projects by 승짱(Okuma). Always respond in Korean. Respond in a ${tone} tone. Keep responses concise and helpful.`

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    // Gemini OpenAI-compatible endpoint
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${geminiApiKey}`
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const fallbackReason: FallbackReason = `gemini_http_${response.status}`
      const errorData = await response.json().catch(() => ({}))
      console.error('Gemini API 오류로 fallback 응답 사용:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData?.error || errorData,
        fallbackReason
      })

      if (response.status === 401 || response.status === 403) {
        console.error('Gemini API 인증 오류: API 키를 확인하세요.')
      }

      return generateFallbackResponse(message, tone, fallbackReason)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.'

    const emotion = analyzeEmotion(message)
    const intent = analyzeIntent(message)

    return {
      success: true,
      response: aiResponse,
      emotion,
      intent,
      confidence: 0.9,
      fallbackReason: null
    }
  } catch (error: any) {
    const fallbackReason: FallbackReason = 'gemini_fetch_error'
    console.error('Gemini API 호출 오류로 fallback 응답 사용:', {
      message: error?.message || 'Unknown error',
      fallbackReason
    })
    return generateFallbackResponse(message, tone, fallbackReason)
  }
}

// 기본 응답 생성 (fallback)
function generateFallbackResponse(message: string, tone: string, fallbackReason: FallbackReason) {
  const toneMap: Record<string, string> = {
    '친근하게': '안녕하세요!',
    '전문적으로': '안녕하십니까.',
    '격식있게': '안녕하십니까.',
    '캐주얼하게': '안녕!'
  }

  const tonePrefix = toneMap[tone] || '안녕하세요!'
  const lowerMessage = message.toLowerCase()
  const messagePreview = message.trim().slice(0, 60)
  let response = tonePrefix + ' '

  if (lowerMessage.includes('안녕') || lowerMessage.includes('hello')) {
    response += '반가워요! 무엇을 도와드릴까요?'
  } else if (lowerMessage.includes('?') || lowerMessage.includes('어떻게') || lowerMessage.includes('왜')) {
    response += `"${messagePreview}"에 대해 단계별로 답변드릴게요. 상황이나 목표를 조금 더 알려주시면 더 정확히 도와드릴 수 있어요.`
  } else if (lowerMessage.includes('코드') || lowerMessage.includes('에러') || lowerMessage.includes('오류')) {
    response += `"${messagePreview}" 관련해서 원인 후보를 좁혀볼게요. 오류 로그와 재현 경로를 함께 주시면 빠르게 해결할 수 있습니다.`
  } else {
    response += `"${messagePreview}"에 대해 확인했습니다. 핵심 목적과 원하는 결과를 알려주시면 맞춤형으로 정리해드릴게요.`
  }

  return {
    success: true,
    response,
    emotion: 'neutral',
    intent: 'general',
    confidence: 0.7,
    fallbackReason
  }
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

function estimateTokensUsed(responseText: string): number {
  // The usage API validates tokensUsed as an integer, so round up the estimate.
  return Math.max(1, Math.ceil(responseText.length / 4))
}

// 감정 분석
function analyzeEmotion(message: string): string {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('감사') || lowerMessage.includes('고마')) return 'positive'
  if (lowerMessage.includes('화나') || lowerMessage.includes('불만')) return 'negative'
  return 'neutral'
}

// 의도 분석
function analyzeIntent(message: string): string {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('?') || lowerMessage.includes('뭐') || lowerMessage.includes('어떻게')) return 'question'
  if (lowerMessage.includes('안녕') || lowerMessage.includes('hello')) return 'greeting'
  return 'general'
}

// 대화 세션 가져오기 또는 생성
async function getOrCreateConversation(sessionId: string, userId: string) {
  try {
    // 먼저 session_id로 기존 대화 찾기
    const existing = await dbQuery<{ id: string }>(
      'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
      [sessionId]
    )
    if (existing.rows[0]) {
      return existing.rows[0]
    }

    // 없으면 새로 생성 (id는 자동 생성, session_id는 제공한 값 사용)
    const newConv = await dbQuery<{ id: string }>(
      `INSERT INTO conversations (session_id, user_id, settings, statistics, is_active)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, true)
       ON CONFLICT (session_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING id`,
      [
        sessionId,
        userId,
        JSON.stringify({ selectedTone: '친근하게', language: 'ko', isActive: true }),
        JSON.stringify({
          totalMessages: 0,
          userMessages: 0,
          aiMessages: 0,
          averageResponseTime: 0,
          mostUsedTone: '친근하게',
          lastActivity: new Date().toISOString()
        })
      ]
    )

    return newConv.rows[0] || null
  } catch (error: any) {
    console.error('getOrCreateConversation 전체 오류:', error)
    return null
  }
}

// 메시지 추가
async function addMessage(sessionId: string, message: any) {
  try {
    // 먼저 conversation의 UUID(id)를 가져와야 함
    const conversationResult = await dbQuery<{ id: string }>(
      'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
      [sessionId]
    )
    const conversation = conversationResult.rows[0]

    if (!conversation) {
      // 대화가 없으면 새로 생성 시도
      console.warn('대화를 찾을 수 없습니다. 새로 생성 시도:', sessionId)
      try {
        const newConv = await getOrCreateConversation(sessionId, 'anonymous')
        if (!newConv) {
          console.warn('대화 생성 실패 (Supabase 연결 문제일 수 있음). 메시지 저장을 건너뜁니다:', sessionId)
          return
        }
        // 새로 생성된 대화로 다시 시도
        const retryResult = await dbQuery<{ id: string }>(
          'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
          [sessionId]
        )
        const retryConv = retryResult.rows[0]
        
        if (!retryConv) {
          console.warn('대화를 여전히 찾을 수 없습니다. 메시지 저장을 건너뜁니다:', sessionId)
          return
        }
        
        // 메시지 저장 계속 진행
        await dbQuery(
          `INSERT INTO messages (
            conversation_id, message_id, content, is_user, ai_features, metadata, response_time, timestamp
          ) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8)`,
          [
            retryConv.id,
            message.id || Date.now().toString(),
            message.content,
            message.isUser,
            JSON.stringify(message.aiFeatures || {}),
            JSON.stringify({ responseTime: message.responseTime || 0, context: message.context || 'portfolio' }),
            message.responseTime || 0,
            new Date().toISOString()
          ]
        )
        return
      } catch (createError: any) {
        console.warn('대화 생성 중 오류 (메시지 저장을 건너뜁니다):', createError?.message || createError)
        return
      }
    }

    await dbQuery(
      `INSERT INTO messages (
        conversation_id, message_id, content, is_user, ai_features, metadata, response_time, timestamp
      ) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8)`,
      [
        conversation.id,
        message.id || Date.now().toString(),
        message.content,
        message.isUser,
        JSON.stringify(message.aiFeatures || {}),
        JSON.stringify({ responseTime: message.responseTime || 0, context: message.context || 'portfolio' }),
        message.responseTime || 0,
        new Date().toISOString()
      ]
    )
  } catch (error: any) {
    console.error('addMessage 전체 오류:', error)
    // 메시지 저장 실패해도 계속 진행
  }
}

// 대화 히스토리 가져오기
async function getConversationHistory(sessionId: string, limit: number = 20) {
  try {
    const conversationResult = await dbQuery<{ id: string }>(
      'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
      [sessionId]
    )
    const conversation = conversationResult.rows[0]

    if (!conversation) {
      return []
    }

    const messageResult = await dbQuery<any>(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC LIMIT $2',
      [conversation.id, limit]
    )
    const messages = messageResult.rows

    if (!messages) {
      return []
    }

    return messages.map((msg: any) => ({
      id: msg.message_id,
      content: msg.content,
      isUser: msg.is_user,
      timestamp: new Date(msg.timestamp),
      aiFeatures: msg.ai_features || {}
    }))
  } catch (error) {
    console.error('대화 히스토리 가져오기 오류:', error)
    return []
  }
}

export async function POST(request: Request) {
  try {
    const { message, tone = '친근하게', sessionId, context = 'portfolio' } = await request.json()
    // This public endpoint has no authenticated identity; do not trust caller-supplied userId for quota checks.
    const effectiveUserId = 'anonymous'

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: '메시지가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    const normalizedMessage = message.trim()
    if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { success: false, error: `메시지는 최대 ${MAX_MESSAGE_LENGTH}자까지 입력할 수 있습니다.` },
        { status: 400 }
      )
    }

    const allowedTones = new Set(['친근하게', '전문적으로', '격식있게', '캐주얼하게'])
    const safeTone = typeof tone === 'string' && allowedTones.has(tone) ? tone : '친근하게'
    const safeContext = context === 'blog' ? 'blog' : 'portfolio'
    const quotaIdentity = getAnonymousQuotaIdentity(request)
    const quotaJson = (body: any, init?: ResponseInit) =>
      applyAnonymousQuotaCookie(NextResponse.json(body, init), quotaIdentity)

    const internalApiBaseUrl = getInternalApiBaseUrl()

    // 구독 상태 확인 및 사용량 제한 체크
    try {
      const subscriptionParams = new URLSearchParams({
        sessionId: quotaIdentity.sessionId
      })
      const subscriptionCheck = await fetchWithTimeout(
        `${internalApiBaseUrl}/api/subscription/check?${subscriptionParams}`
      )
      const subscriptionData = await subscriptionCheck.json()

      if (!subscriptionCheck.ok || !subscriptionData.success || !subscriptionData.subscription) {
        console.error('구독 상태 확인 실패로 AI 응답을 차단합니다:', {
          status: subscriptionCheck.status,
          error: subscriptionData?.error,
          errorCode: subscriptionData?.errorCode
        })
        return quotaJson(
          {
            success: false,
            error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
            errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE'
          },
          { status: 503 }
        )
      }
      
      const { subscription: sub } = subscriptionData
      const { usage, limits } = sub
      
      // 무료 사용자의 일일 메시지 제한 체크
      if (!sub.isPremium && usage.chat >= limits.dailyChatMessages) {
        return quotaJson(
          {
            success: false,
            error: '일일 무료 메시지 한도를 초과했습니다.',
            errorCode: 'DAILY_LIMIT_EXCEEDED',
            limit: limits.dailyChatMessages,
            used: usage.chat,
            upgradeRequired: true
          },
          { status: 403 }
        )
      }
    } catch (subError: any) {
      console.error('구독 상태 확인 실패로 AI 응답을 차단합니다:', subError?.message || 'unknown')
      return quotaJson(
        {
          success: false,
          error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
          errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE'
        },
        { status: 503 }
      )
    }

    const startTime = Date.now()

    // 1. 대화 세션 가져오기 또는 생성
    let conversation = null
    try {
      conversation = await getOrCreateConversation(sessionId, effectiveUserId)
      if (!conversation) {
        console.warn('대화 세션을 생성할 수 없지만 계속 진행합니다:', sessionId)
      }
    } catch (error: any) {
      console.error('대화 세션 처리 오류:', error)
      // 세션 생성 실패해도 계속 진행
    }

    // 2. 대화 히스토리 가져오기
    const conversationHistory = await getConversationHistory(sessionId, 20)

    // 3. 사용자 메시지 저장
    try {
      await addMessage(sessionId, {
        id: Date.now().toString(),
        content: normalizedMessage,
        isUser: true,
        timestamp: new Date(),
        responseTime: 0,
        context: safeContext // 포트폴리오/블로그 구분 저장
      })
    } catch (error: any) {
      console.error('사용자 메시지 저장 오류:', error)
      // 메시지 저장 실패해도 계속 진행
    }

    // 4. AI 응답 생성 (Gemini API 사용)
    const aiResponse = await generateAIResponse(normalizedMessage, safeTone, safeContext, conversationHistory)
    const responseTime = Date.now() - startTime

    // 4-1. 사용량 기록
    try {
      const usageResponse = await fetchWithTimeout(`${internalApiBaseUrl}/api/subscription/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: null,
          sessionId: quotaIdentity.sessionId,
          usageType: 'chat',
          messageCount: 1,
          tokensUsed: estimateTokensUsed(aiResponse.response)
        })
      })
      const usageData = await usageResponse.json().catch(() => ({}))
      if (!usageResponse.ok || !usageData.success) {
        console.error('사용량 기록 실패로 AI 응답을 차단합니다:', {
          status: usageResponse.status,
          error: usageData?.error,
          errorCode: usageData?.errorCode
        })
        return quotaJson(
          {
            success: false,
            error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
            errorCode: 'USAGE_RECORD_UNAVAILABLE'
          },
          { status: 503 }
        )
      }
    } catch (usageError: any) {
      console.error('사용량 기록 실패로 AI 응답을 차단합니다:', usageError?.message || 'unknown')
      return quotaJson(
        {
          success: false,
          error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
          errorCode: 'USAGE_RECORD_UNAVAILABLE'
        },
        { status: 503 }
      )
    }

    // 5. AI 응답 저장
    try {
      await addMessage(sessionId, {
        id: (Date.now() + 1).toString(),
        content: aiResponse.response,
        isUser: false,
        timestamp: new Date(),
        aiFeatures: {
          tone: safeTone,
          emotion: aiResponse.emotion,
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          context: safeContext // 포트폴리오/블로그 구분 저장
        },
        responseTime: responseTime,
        context: safeContext
      })
    } catch (error: any) {
      console.error('AI 메시지 저장 오류:', error)
      // 메시지 저장 실패해도 계속 진행
    }

    const isFallback = aiResponse.fallbackReason !== null

    return quotaJson({
      success: aiResponse.success,
      response: aiResponse.response,
      emotion: aiResponse.emotion,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      responseTime: responseTime,
      sessionId: sessionId,
      isFallback: isFallback,
      fallbackReason: aiResponse.fallbackReason,
      ...(isFallback && {
        warning: 'Gemini API를 사용할 수 없어 기본 응답을 반환했습니다. 환경 변수 GEMINI_API_KEY를 확인하세요.'
      })
    })

  } catch (error: any) {
    console.error('AI 채팅 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'AI 응답 생성 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}

