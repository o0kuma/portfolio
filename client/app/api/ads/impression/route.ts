export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'

// 광고 노출 기록 API
export async function POST(request: Request) {
  try {
    const { advertisementId, postId, sessionId, position } = await request.json()

    if (!advertisementId) {
      return NextResponse.json(
        { success: false, error: 'advertisementId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 노출 기록 생성
    const { data: impression, error } = await supabase
      .from('ad_impressions')
      .insert({
        advertisement_id: advertisementId,
        post_id: postId || null,
        session_id: sessionId || null,
        position: position || null,
        viewed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('노출 기록 오류:', error)
      return NextResponse.json(
        { success: false, error: '노출 기록 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 광고의 현재 노출 수 증가
    await supabase.rpc('increment_ad_impressions', {
      ad_id: advertisementId
    }).catch(() => {
      // RPC 함수가 없으면 직접 업데이트
      supabase
        .from('advertisements')
        .update({ current_impressions: supabase.raw('current_impressions + 1') })
        .eq('id', advertisementId)
    })

    return NextResponse.json({
      success: true,
      impressionId: impression.id
    })
  } catch (error: any) {
    console.error('노출 기록 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: '노출 기록 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}

