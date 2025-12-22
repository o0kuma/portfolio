export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'

// 광고 클릭 기록 API
export async function POST(request: Request) {
  try {
    const { advertisementId, impressionId, postId, sessionId } = await request.json()

    if (!advertisementId) {
      return NextResponse.json(
        { success: false, error: 'advertisementId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 광고 정보 조회 (수익 계산용)
    const { data: ad } = await supabase
      .from('advertisements')
      .select('cpc, cpm')
      .eq('id', advertisementId)
      .single()

    // 수익 계산
    let revenue = 0
    if (ad?.cpc && ad.cpc > 0) {
      revenue = Number(ad.cpc)
    } else if (ad?.cpm && ad.cpm > 0) {
      revenue = Number(ad.cpm) / 1000 // CPM을 클릭당 수익으로 추정
    }

    // 클릭 기록 생성
    const { data: click, error } = await supabase
      .from('ad_clicks')
      .insert({
        advertisement_id: advertisementId,
        impression_id: impressionId || null,
        post_id: postId || null,
        session_id: sessionId || null,
        clicked_at: new Date().toISOString(),
        revenue: revenue
      })
      .select()
      .single()

    if (error) {
      console.error('클릭 기록 오류:', error)
      return NextResponse.json(
        { success: false, error: '클릭 기록 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 광고의 현재 클릭 수 증가
    // 먼저 현재 값을 가져온 후 증가
    const { data: currentAd } = await supabase
      .from('advertisements')
      .select('current_clicks')
      .eq('id', advertisementId)
      .single()
    
    if (currentAd) {
      const { error: updateError } = await supabase
        .from('advertisements')
        .update({ current_clicks: (currentAd.current_clicks || 0) + 1 })
        .eq('id', advertisementId)
      
      if (updateError) {
        console.error('클릭 수 업데이트 오류:', updateError)
      }
    }

    // 노출 기록 업데이트
    if (impressionId) {
      await supabase
        .from('ad_impressions')
        .update({ is_clicked: true })
        .eq('id', impressionId)
        .catch(console.error)
    }

    return NextResponse.json({
      success: true,
      clickId: click.id,
      revenue: revenue
    })
  } catch (error: any) {
    console.error('클릭 기록 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: '클릭 기록 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}

