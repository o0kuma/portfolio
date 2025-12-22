export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'

// AI 사용량 기록 및 확인
export async function POST(request: Request) {
  try {
    const { userId, sessionId, usageType, messageCount = 1, tokensUsed = 0 } = await request.json()

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

    const today = new Date().toISOString().split('T')[0]

    // 사용량 기록
    const { data, error } = await supabase
      .from('ai_usage')
      .upsert({
        user_id: userId || null,
        session_id: sessionId || null,
        usage_type: usageType,
        message_count: messageCount,
        tokens_used: tokensUsed,
        date: today
      }, {
        onConflict: 'user_id,date,usage_type'
      })
      .select()

    if (error) {
      console.error('사용량 기록 오류:', error)
      // 사용량 기록 실패해도 계속 진행
    }

    return NextResponse.json({
      success: true,
      usage: data?.[0] || null
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

    let query = supabase
      .from('ai_usage')
      .select('*')
      .eq('date', date)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data, error } = await query

    if (error) {
      console.error('사용량 조회 오류:', error)
      return NextResponse.json(
        { success: false, error: '사용량 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    const usageMap: Record<string, number> = {}
    if (data) {
      data.forEach(u => {
        usageMap[u.usage_type] = (usageMap[u.usage_type] || 0) + u.message_count
      })
    }

    return NextResponse.json({
      success: true,
      date,
      usage: usageMap,
      details: data || []
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

