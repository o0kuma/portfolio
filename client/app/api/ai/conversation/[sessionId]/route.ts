export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

const SESSION_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,128}$/

function isValidSessionId(value: string | null | undefined): value is string {
  if (!value) return false
  return SESSION_ID_PATTERN.test(value)
}

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const { searchParams } = new URL(request.url)
    const requestedLimit = parseInt(searchParams.get('limit') || '50', 10)
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { success: false, error: '유효한 sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    let conversation: { id: string } | undefined
    try {
      // 먼저 conversation의 UUID(id)를 가져와야 함
      const conversationResult = await dbQuery<{ id: string }>(
        'SELECT id FROM conversations WHERE session_id = $1 LIMIT 1',
        [sessionId]
      )
      conversation = conversationResult.rows[0]
    } catch (error: any) {
      console.error('ai/conversation lookup failed:', {
        code: error?.code,
        message: error?.message,
        sessionId
      })
      return NextResponse.json({
        success: true,
        sessionId,
        messages: [],
        count: 0,
        warning: 'conversation_lookup_failed'
      })
    }

    if (!conversation) {
      return NextResponse.json({
        success: true,
        sessionId: sessionId,
        messages: [],
        count: 0
      })
    }

    // 대화 히스토리 조회 (conversation_id는 UUID)
    let messages: any[] = []
    try {
      const messageResult = await dbQuery<any>(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC LIMIT $2',
        [conversation.id, limit]
      )
      messages = messageResult.rows || []
    } catch (error: any) {
      console.error('ai/conversation message lookup failed:', {
        code: error?.code,
        message: error?.message,
        sessionId
      })
    }

    // 메시지를 ChatMessage 형식으로 변환
    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.message_id?.toString() || msg.id?.toString() || Date.now().toString(),
      content: msg.content || '',
      isUser: msg.is_user === true,
      timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
      aiFeatures: msg.ai_features || msg.meta || {}
    }))

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      messages: formattedMessages,
      count: formattedMessages.length
    })

  } catch (error: any) {
    console.error('ai/conversation unexpected error:', {
      code: error?.code,
      message: error?.message
    })
    return NextResponse.json(
      {
        success: false,
        error: '대화 히스토리 조회 중 오류가 발생했습니다.',
        errorCode: 'AI_CONVERSATION_FETCH_ERROR'
      },
      { status: 500 }
    )
  }
}

