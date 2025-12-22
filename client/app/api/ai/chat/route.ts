export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'
import * as fs from 'fs'
import * as path from 'path'

// server/.env 또는 server/env.example 파일에서 OPENAI_API_KEY 로드 (런타임)
// 프로덕션 환경에서는 파일 시스템 접근을 시도하지 않음 (Vercel 등에서는 환경 변수 직접 설정 필요)
function loadServerEnv() {
  // 프로덕션 환경에서는 파일 시스템 접근 시도하지 않음
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
              if (key === 'OPENAI_API_KEY' && value && !process.env.OPENAI_API_KEY) {
                process.env.OPENAI_API_KEY = value
                if (process.env.NODE_ENV === 'development') {
                  console.log(`✅ 초기 로드: ${path.basename(envPath)}에서 OPENAI_API_KEY 발견`)
                }
                return // 키를 찾았으면 중단
              }
            }
          }
        })
        if (process.env.OPENAI_API_KEY) break // 키를 찾았으면 다른 파일 확인 불필요
      }
    }
  } catch (error) {
    // 환경 변수 로드 실패해도 계속 진행
    if (process.env.NODE_ENV === 'development') {
      console.warn('server 환경 변수 파일 로드 실패:', error)
    }
  }
}

// API Route 실행 시 환경 변수 로드 (초기 로드)
loadServerEnv()

// ChatGPT API를 사용한 AI 응답 생성
async function generateAIResponse(
  message: string, 
  tone: string = '친근하게',
  context: string = 'portfolio', // 'portfolio' 또는 'blog'
  conversationHistory: any[] = []
): Promise<{
  success: boolean
  response: string
  emotion: string
  intent: string
  confidence: number
}> {
  // 환경 변수가 이미 설정되어 있지 않은 경우에만 파일에서 로드 시도
  // 배포 환경(Vercel 등)에서는 환경 변수가 직접 설정되어 있어야 함
  // 프로덕션 환경에서는 파일 시스템 접근을 시도하지 않음
  if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    try {
      const serverDir = path.join(process.cwd(), '..', 'server')
      const envPaths = [
        path.join(serverDir, '.env'),
        path.join(serverDir, 'env.example'),
        path.join(serverDir, '.env.example')
      ]
      
      let envLoaded = false
      for (const envPath of envPaths) {
        try {
          if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8')
            envFile.split('\n').forEach(line => {
              const trimmedLine = line.trim()
              if (trimmedLine && !trimmedLine.startsWith('#')) {
                const match = trimmedLine.match(/^([^=:#]+)=(.*)$/)
                if (match) {
                  const key = match[1].trim()
                  const value = match[2].trim().replace(/^["']|["']$/g, '')
                  if (key === 'OPENAI_API_KEY' && value) {
                    process.env.OPENAI_API_KEY = value
                    envLoaded = true
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`✅ ${path.basename(envPath)}에서 OPENAI_API_KEY 로드됨`)
                    }
                  }
                }
              }
            })
            if (envLoaded) break
          }
        } catch (fileError) {
          // 개별 파일 로드 실패는 무시하고 다음 파일 시도
          continue
        }
      }
      
      if (!envLoaded) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ server/.env 또는 server/env.example 파일을 찾을 수 없습니다.')
          console.warn('시도한 경로:', envPaths)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('server 환경 변수 파일 로드 중 오류:', error)
      }
    }
  }

  // 환경 변수 확인 (여러 가능한 이름 시도)
  // Vercel 환경 변수가 우선적으로 사용됨
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim() || 
                       process.env.NEXT_PUBLIC_OPENAI_API_KEY?.trim() ||
                       process.env.OPENAI_KEY?.trim()
  
  // 디버깅: 환경 변수 확인
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isVercel = !!process.env.VERCEL
  
  if (isDevelopment || isVercel) {
    console.log('=== OpenAI 환경 변수 디버깅 ===')
    console.log('환경:', isVercel ? 'Vercel (Production)' : 'Local (Development)')
    console.log('OPENAI_API_KEY 존재:', !!process.env.OPENAI_API_KEY)
    console.log('OPENAI_API_KEY 길이:', process.env.OPENAI_API_KEY?.length || 0)
    if (process.env.OPENAI_API_KEY) {
      console.log('OPENAI_API_KEY 값 (처음 20자):', process.env.OPENAI_API_KEY.substring(0, 20) + '...')
    }
    console.log('NEXT_PUBLIC_OPENAI_API_KEY 존재:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY)
    console.log('OPENAI_KEY 존재:', !!process.env.OPENAI_KEY)
    console.log('모든 OPENAI 관련 환경 변수:', 
      Object.keys(process.env).filter(key => key.toUpperCase().includes('OPENAI'))
    )
    console.log('최종 선택된 키:', openaiApiKey ? openaiApiKey.substring(0, 20) + '...' : '없음')
    console.log('================================')
  }
  
  if (!openaiApiKey || openaiApiKey.length < 10) {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL
    console.error('[ERROR] OPENAI_API_KEY가 설정되지 않았습니다. 기본 응답을 사용합니다.')
    
    if (isProduction) {
      console.error('프로덕션 환경에서는 환경 변수를 플랫폼에서 직접 설정해야 합니다:')
      console.error('1. Vercel: 프로젝트 설정 > Environment Variables에서 OPENAI_API_KEY 추가')
      console.error('2. 다른 플랫폼: 해당 플랫폼의 환경 변수 설정에서 OPENAI_API_KEY 추가')
      console.error('3. 환경 변수 이름: OPENAI_API_KEY (또는 NEXT_PUBLIC_OPENAI_API_KEY)')
    } else {
      console.warn('해결 방법:')
      console.warn('1. server/.env 파일을 확인하세요 (경로:', path.join(process.cwd(), '..', 'server', '.env'), ')')
      console.warn('2. 파일에 OPENAI_API_KEY=your-api-key-here 형식으로 추가하세요')
      console.warn('3. Next.js 개발 서버를 재시작하세요 (npm run dev)')
    }
    return generateFallbackResponse(message, tone)
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ OpenAI API 키 발견:', openaiApiKey.substring(0, 20) + '...')
  }

  try {
    // 컨텍스트에 따른 시스템 프롬프트 설정
    const systemPrompt = context === 'blog' 
      ? `You are a helpful assistant for a blog website called "iykyk blog". The blog covers topics like Tech, Economy, Coin, Travel, Food, and Lottery. Respond in a ${tone} tone. Keep responses concise and helpful.`
      : `You are a helpful assistant for a portfolio website. The portfolio showcases web development projects. Respond in a ${tone} tone. Keep responses concise and helpful.`

    // 대화 히스토리 형식 변환
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API 오류:', errorData)
      return generateFallbackResponse(message, tone)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.'

    // 감정 및 의도 분석 (간단한 키워드 기반)
    const emotion = analyzeEmotion(message)
    const intent = analyzeIntent(message)

    return {
      success: true,
      response: aiResponse,
      emotion,
      intent,
      confidence: 0.9
    }
  } catch (error: any) {
    console.error('ChatGPT API 호출 오류:', error)
    return generateFallbackResponse(message, tone)
  }
}

// 기본 응답 생성 (fallback)
function generateFallbackResponse(message: string, tone: string) {
  const toneMap: Record<string, string> = {
    '친근하게': '안녕하세요!',
    '전문적으로': '안녕하십니까.',
    '격식있게': '안녕하십니까.',
    '캐주얼하게': '안녕!'
  }

  const tonePrefix = toneMap[tone] || '안녕하세요!'
  const lowerMessage = message.toLowerCase()
  let response = tonePrefix + ' '

  if (lowerMessage.includes('안녕') || lowerMessage.includes('hello')) {
    response += '반가워요! 무엇을 도와드릴까요?'
  } else {
    response += '좋은 질문이네요! 더 자세히 알려주시면 도와드리겠습니다.'
  }

  return {
    success: true,
    response,
    emotion: 'neutral',
    intent: 'general',
    confidence: 0.7
  }
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
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (existing && !findError) {
      return existing
    }

    // 없으면 새로 생성 (id는 자동 생성, session_id는 제공한 값 사용)
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert([{
        session_id: sessionId,  // session_id 컬럼 사용
        user_id: userId,
        settings: {
          selectedTone: '친근하게',
          language: 'ko',
          isActive: true
        },
        statistics: {
          totalMessages: 0,
          userMessages: 0,
          aiMessages: 0,
          averageResponseTime: 0,
          mostUsedTone: '친근하게',
          lastActivity: new Date().toISOString()
        }
      }])
      .select()
      .single()

    if (error) {
      // unique_violation (23505) = 이미 존재하는 경우, 다시 조회
      if (error.code === '23505' || error.code === 'P2002') {
        const { data: retryExisting } = await supabase
          .from('conversations')
          .select('id')
          .eq('session_id', sessionId)
          .single()
        if (retryExisting) {
          return retryExisting
        }
      }
      console.error('대화 생성 오류:', error)
      // 오류가 발생해도 계속 진행 (메시지 저장은 선택 사항)
      return null
    }

    return newConv || existing
  } catch (error: any) {
    console.error('getOrCreateConversation 전체 오류:', error)
    return null
  }
}

// 메시지 추가
async function addMessage(sessionId: string, message: any) {
  try {
    // 먼저 conversation의 UUID(id)를 가져와야 함
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (convError || !conversation) {
      // 대화가 없으면 새로 생성 시도
      console.warn('대화를 찾을 수 없습니다. 새로 생성 시도:', sessionId)
      try {
        const newConv = await getOrCreateConversation(sessionId, 'anonymous')
        if (!newConv) {
          console.warn('대화 생성 실패 (Supabase 연결 문제일 수 있음). 메시지 저장을 건너뜁니다:', sessionId)
          return
        }
        // 새로 생성된 대화로 다시 시도
        const { data: retryConv, error: retryError } = await supabase
          .from('conversations')
          .select('id')
          .eq('session_id', sessionId)
          .single()
        
        if (retryError || !retryConv) {
          console.warn('대화를 여전히 찾을 수 없습니다. 메시지 저장을 건너뜁니다:', sessionId)
          return
        }
        
        // 메시지 저장 계속 진행
        const { error } = await supabase
          .from('messages')
          .insert([{
            conversation_id: retryConv.id,
            message_id: message.id || Date.now().toString(),
            content: message.content,
            is_user: message.isUser,
            ai_features: message.aiFeatures || {},
            metadata: { 
              responseTime: message.responseTime || 0,
              context: message.context || 'portfolio'
            },
            response_time: message.responseTime || 0,
            timestamp: new Date().toISOString()
          }])
        
        if (error) {
          console.error('메시지 저장 오류:', error)
        }
        return
      } catch (createError: any) {
        console.warn('대화 생성 중 오류 (메시지 저장을 건너뜁니다):', createError?.message || createError)
        return
      }
    }

    const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversation.id,  // UUID 사용
          message_id: message.id || Date.now().toString(),
          content: message.content,
          is_user: message.isUser,
          ai_features: message.aiFeatures || {},
          metadata: { 
            responseTime: message.responseTime || 0,
            context: message.context || 'portfolio' // 포트폴리오/블로그 구분 저장
          },
          response_time: message.responseTime || 0,
          timestamp: new Date().toISOString()
        }])

    if (error) {
      console.error('메시지 저장 오류:', error)
      // 메시지 저장 실패해도 계속 진행
    }
  } catch (error: any) {
    console.error('addMessage 전체 오류:', error)
    // 메시지 저장 실패해도 계속 진행
  }
}

// 대화 히스토리 가져오기
async function getConversationHistory(sessionId: string, limit: number = 20) {
  try {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (!conversation) {
      return []
    }

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('timestamp', { ascending: true })
      .limit(limit)

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
    const { message, tone = '친근하게', sessionId, userId = 'anonymous', context = 'portfolio' } = await request.json()

    if (!message) {
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

    const startTime = Date.now()

    // 1. 대화 세션 가져오기 또는 생성
    let conversation = null
    try {
      conversation = await getOrCreateConversation(sessionId, userId)
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
        content: message,
        isUser: true,
        timestamp: new Date(),
        responseTime: 0,
        context: context // 포트폴리오/블로그 구분 저장
      })
    } catch (error: any) {
      console.error('사용자 메시지 저장 오류:', error)
      // 메시지 저장 실패해도 계속 진행
    }

    // 4. AI 응답 생성 (ChatGPT API 사용)
    const aiResponse = await generateAIResponse(message, tone, context, conversationHistory)
    const responseTime = Date.now() - startTime

    // 5. AI 응답 저장
    try {
      await addMessage(sessionId, {
        id: (Date.now() + 1).toString(),
        content: aiResponse.response,
        isUser: false,
        timestamp: new Date(),
        aiFeatures: {
          tone: tone,
          emotion: aiResponse.emotion,
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          context: context // 포트폴리오/블로그 구분 저장
        },
        responseTime: responseTime,
        context: context
      })
    } catch (error: any) {
      console.error('AI 메시지 저장 오류:', error)
      // 메시지 저장 실패해도 계속 진행
    }

    return NextResponse.json({
      success: aiResponse.success,
      response: aiResponse.response,
      emotion: aiResponse.emotion,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      responseTime: responseTime,
      sessionId: sessionId
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

