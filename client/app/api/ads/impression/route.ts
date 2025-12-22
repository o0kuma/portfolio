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
    // 먼저 현재 값을 가져온 후 증가
    const { data: currentAd } = await supabase
      .from('advertisements')
      .select('current_impressions')
      .eq('id', advertisementId)
      .single()
    
    if (currentAd) {
      const { error: updateError } = await supabase
        .from('advertisements')
        .update({ current_impressions: (currentAd.current_impressions || 0) + 1 })
        .eq('id', advertisementId)
      
      if (updateError) {
        console.error('노출 수 업데이트 오류:', updateError)
      }
    }

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

