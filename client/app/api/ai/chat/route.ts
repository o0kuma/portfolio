export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { applyAnonymousQuotaCookie, getAnonymousQuotaIdentity } from '@/lib/anonymous-quota'
import { reserveAnonymousChatQuota, addAnonymousChatTokens } from '@/lib/ai-chat-quota'
import { recordAiRequest } from '@/lib/aiStats'
import * as fs from 'fs'
import * as path from 'path'

const MAX_MESSAGE_LENGTH = 4000

type FallbackReason = 'missing_api_key' | `anthropic_http_${number}` | 'anthropic_error' | null

type ConversationMessage = {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  aiFeatures: Record<string, unknown>
}

// Anthropic API 키를 가져오는 헬퍼 함수
function getAnthropicApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim()
  if (key && key.length >= 10) {
    return key
  }
  return null
}

// server/.env 파일에서 ANTHROPIC_API_KEY 로드 (개발 환경 전용)
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
              if (key === 'ANTHROPIC_API_KEY' && value && !process.env.ANTHROPIC_API_KEY) {
                process.env.ANTHROPIC_API_KEY = value
                return
              }
            }
          }
        })
        if (process.env.ANTHROPIC_API_KEY) break
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('server 환경 변수 파일 로드 실패:', error)
    }
  }
}

loadServerEnv()

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

  return { text: response, fallbackReason }
}

function estimateTokensUsed(responseText: string): number {
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
    const existing = await dbQuery<{ id: string }>(
      'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
      [sessionId]
    )
    if (existing.rows[0]) {
      return existing.rows[0]
    }

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
  } catch (error: unknown) {
    console.error('getOrCreateConversation 전체 오류:', error)
    return null
  }
}

type MessageInput = {
  id?: string
  content: string
  isUser: boolean
  timestamp: Date
  responseTime?: number
  context?: string
  aiFeatures?: Record<string, unknown>
}

// 메시지 추가
async function addMessage(sessionId: string, message: MessageInput) {
  try {
    const conversationResult = await dbQuery<{ id: string }>(
      'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
      [sessionId]
    )
    const conversation = conversationResult.rows[0]

    if (!conversation) {
      console.warn('대화를 찾을 수 없습니다. 새로 생성 시도:', sessionId)
      try {
        const newConv = await getOrCreateConversation(sessionId, 'anonymous')
        if (!newConv) {
          console.warn('대화 생성 실패 (Supabase 연결 문제일 수 있음). 메시지 저장을 건너뜁니다:', sessionId)
          return
        }
        const retryResult = await dbQuery<{ id: string }>(
          'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
          [sessionId]
        )
        const retryConv = retryResult.rows[0]

        if (!retryConv) {
          console.warn('대화를 여전히 찾을 수 없습니다. 메시지 저장을 건너뜁니다:', sessionId)
          return
        }

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
      } catch (createError: unknown) {
        const errMsg = createError instanceof Error ? createError.message : String(createError)
        console.warn('대화 생성 중 오류 (메시지 저장을 건너뜁니다):', errMsg)
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
  } catch (error: unknown) {
    console.error('addMessage 전체 오류:', error)
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

    type MessageRow = { message_id: string; content: string; is_user: boolean; timestamp: string; ai_features: Record<string, unknown> }
    const messageResult = await dbQuery<MessageRow>(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC LIMIT $2',
      [conversation.id, limit]
    )
    const messages = messageResult.rows

    if (!messages) {
      return []
    }

    return messages.map((msg) => ({
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

function buildCookieHeader(identity: ReturnType<typeof getAnonymousQuotaIdentity>): string | null {
  if (!identity.shouldSetCookie || !identity.cookieValue) return null
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const maxAge = 60 * 60 * 24 * 30
  return `portfolio_ai_quota_id=${encodeURIComponent(identity.cookieValue)}; HttpOnly; SameSite=Lax; Path=/${secure}; Max-Age=${maxAge}`
}

export async function POST(request: Request) {
  try {
    const { message, tone = '친근하게', sessionId, context = 'portfolio' } = await request.json()
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

    const errorJson = (body: unknown, status: number) => {
      const res = NextResponse.json(body, { status })
      applyAnonymousQuotaCookie(res, quotaIdentity)
      return res
    }

    // Reserve one message atomically before AI call (prevents concurrent quota bypass)
    const quota = await reserveAnonymousChatQuota(quotaIdentity.sessionId)
    if (!quota.ok) {
      console.error('사용량 예약 실패로 AI 응답을 차단합니다 (DB 기록 실패)')
      return errorJson(
        {
          success: false,
          error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
          errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE'
        },
        503
      )
    }
    if (quota.exceeded) {
      return errorJson(
        {
          success: false,
          error: '일일 무료 메시지 한도를 초과했습니다.',
          errorCode: 'DAILY_LIMIT_EXCEEDED',
          limit: quota.limit,
          used: quota.used,
          upgradeRequired: true
        },
        403
      )
    }

    const startTime = Date.now()

    // 1. 대화 세션 가져오기 또는 생성
    try {
      const conversation = await getOrCreateConversation(sessionId, effectiveUserId)
      if (!conversation) {
        console.warn('대화 세션을 생성할 수 없지만 계속 진행합니다:', sessionId)
      }
    } catch (error: unknown) {
      console.error('대화 세션 처리 오류:', error)
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
        context: safeContext
      })
    } catch (error: unknown) {
      console.error('사용자 메시지 저장 오류:', error)
    }

    // 4. Anthropic API 키 확인
    if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      loadServerEnv()
    }
    const apiKey = getAnthropicApiKey()

    const cookieHeader = buildCookieHeader(quotaIdentity)
    const streamHeaders: Record<string, string> = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Quota-Used': String(quota.used),
      'X-Quota-Limit': String(quota.limit),
    }
    if (cookieHeader) streamHeaders['Set-Cookie'] = cookieHeader

    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ ANTHROPIC_API_KEY가 설정되지 않았습니다. 기본 응답을 사용합니다.')
      }
      const fallback = generateFallbackResponse(normalizedMessage, safeTone, 'missing_api_key')
      const responseTime = Date.now() - startTime
      await addAnonymousChatTokens(quotaIdentity.sessionId, estimateTokensUsed(fallback.text)).catch(() => {})
      await addMessage(sessionId, {
        id: (Date.now() + 1).toString(),
        content: fallback.text,
        isUser: false,
        timestamp: new Date(),
        aiFeatures: { tone: safeTone, emotion: 'neutral', intent: 'general', confidence: 0.7, context: safeContext },
        responseTime,
        context: safeContext
      }).catch(() => {})

      const fallbackStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(fallback.text))
          controller.close()
        }
      })
      return new Response(fallbackStream, { headers: streamHeaders })
    }

    // 5. Build Anthropic messages
    const systemPrompt = safeContext === 'blog'
      ? `You are a helpful assistant for a blog website called "iykyk blog". The blog covers topics like Tech, Economy, Coin, Travel, Food, and Lottery. Always respond in Korean. Respond in a ${safeTone} tone. Keep responses concise and helpful.`
      : `You are a helpful assistant for a portfolio website. The portfolio showcases web development projects by 승짱(Okuma). Always respond in Korean. Respond in a ${safeTone} tone. Keep responses concise and helpful.`

    const conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...conversationHistory.slice(-10).map((msg: ConversationMessage) => ({
        role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: normalizedMessage }
    ]

    // 6. Increment stats before streaming (can't do it after)
    recordAiRequest()

    const emotion = analyzeEmotion(normalizedMessage)
    const intent = analyzeIntent(normalizedMessage)

    try {
      const anthropic = new Anthropic({ apiKey })
      const stream = await anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: conversationMessages,
        system: systemPrompt,
      })

      let fullResponse = ''
      const responseTime = Date.now() - startTime

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                const text = chunk.delta.text
                fullResponse += text
                controller.enqueue(new TextEncoder().encode(text))
              }
            }
          } finally {
            controller.close()
            await addAnonymousChatTokens(quotaIdentity.sessionId, estimateTokensUsed(fullResponse)).catch(() => {})
            await addMessage(sessionId, {
              id: (Date.now() + 1).toString(),
              content: fullResponse,
              isUser: false,
              timestamp: new Date(),
              aiFeatures: { tone: safeTone, emotion, intent, confidence: 0.9, context: safeContext },
              responseTime,
              context: safeContext
            }).catch(() => {})
          }
        }
      })

      return new Response(readableStream, { headers: streamHeaders })
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error('Anthropic API 호출 오류로 fallback 응답 사용:', errMsg)

      const fallback = generateFallbackResponse(normalizedMessage, safeTone, 'anthropic_error')
      const responseTime = Date.now() - startTime
      await addAnonymousChatTokens(quotaIdentity.sessionId, estimateTokensUsed(fallback.text)).catch(() => {})
      await addMessage(sessionId, {
        id: (Date.now() + 1).toString(),
        content: fallback.text,
        isUser: false,
        timestamp: new Date(),
        aiFeatures: { tone: safeTone, emotion: 'neutral', intent: 'general', confidence: 0.7, context: safeContext },
        responseTime,
        context: safeContext
      }).catch(() => {})

      const fallbackStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(fallback.text))
          controller.close()
        }
      })
      return new Response(fallbackStream, { headers: streamHeaders })
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('AI 채팅 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'AI 응답 생성 중 오류가 발생했습니다.',
        details: message
      },
      { status: 500 }
    )
  }
}
