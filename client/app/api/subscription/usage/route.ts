export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

// AI 사용량 기록 및 확인
export async function POST(request: Request) {
  try {
    const { userId, sessionId, usageType, messageCount = 1, tokensUsed = 0 } = await request.json()

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'userId 또는 sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!usageType) {
      return NextResponse.json(
        { success: false, error: 'usageType이 필요합니다.' },
        { status: 400 }
      )
    }

    const validUsageTypes = ['chat', 'improve', 'translate', 'summarize', 'suggest']
    if (!validUsageTypes.includes(usageType)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 usageType입니다.' },
        { status: 400 }
      )
    }

    if (
      !Number.isInteger(messageCount) ||
      messageCount <= 0 ||
      !Number.isFinite(tokensUsed) ||
      tokensUsed < 0
    ) {
      return NextResponse.json(
        { success: false, error: '사용량 값은 양수여야 합니다.' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]

    // 사용량 기록
    const data = await dbQuery<any>(
      `INSERT INTO ai_usage (user_id, session_id, usage_type, message_count, tokens_used, date)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id, date, usage_type)
       DO UPDATE SET
         message_count = ai_usage.message_count + EXCLUDED.message_count,
         tokens_used = ai_usage.tokens_used + EXCLUDED.tokens_used
       RETURNING *`,
      [userId || null, sessionId || null, usageType, messageCount, tokensUsed, today]
    )

    return NextResponse.json({
      success: true,
      usage: data.rows[0] || null
    })
  } catch (error: any) {
    console.error('사용량 기록 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: '사용량 기록 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// 사용량 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'userId 또는 sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    const data = await dbQuery<any>(
      userId
        ? 'SELECT * FROM ai_usage WHERE date = $1 AND user_id = $2'
        : 'SELECT * FROM ai_usage WHERE date = $1 AND session_id = $2',
      [date, userId || sessionId]
    )

    const usageMap: Record<string, number> = {}
    if (data.rows) {
      data.rows.forEach(u => {
        usageMap[u.usage_type] = (usageMap[u.usage_type] || 0) + u.message_count
      })
    }

    return NextResponse.json({
      success: true,
      date,
      usage: usageMap,
      details: data.rows || []
    })
  } catch (error: any) {
    console.error('사용량 조회 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: '사용량 조회 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}

