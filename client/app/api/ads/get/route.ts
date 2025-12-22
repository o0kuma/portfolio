export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'

// 광고 조회 API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'banner'
    const position = searchParams.get('position') || 'top'
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []

    // 활성 광고 조회
    let query = supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .eq('ad_type', type)
      .or(`position.eq.${position},position.is.null`)
      .lte('start_date', new Date().toISOString().split('T')[0])
      .or(`end_date.gte.${new Date().toISOString().split('T')[0]},end_date.is.null`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)

    const { data: ads, error } = await query

    if (error) {
      console.error('광고 조회 오류:', error)
      return NextResponse.json(
        { success: false, error: '광고 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (!ads || ads.length === 0) {
      return NextResponse.json({
        success: true,
        ad: null
      })
    }

    // 카테고리/태그 필터링
    let filteredAd = ads[0]
    
    if (category && filteredAd.target_categories && filteredAd.target_categories.length > 0) {
      if (!filteredAd.target_categories.includes(category)) {
        return NextResponse.json({
          success: true,
          ad: null
        })
      }
    }

    if (tags.length > 0 && filteredAd.target_tags && filteredAd.target_tags.length > 0) {
      const hasMatchingTag = tags.some(tag => filteredAd.target_tags.includes(tag))
      if (!hasMatchingTag) {
        return NextResponse.json({
          success: true,
          ad: null
        })
      }
    }

    // 최대 노출/클릭 수 체크
    if (filteredAd.max_impressions && filteredAd.current_impressions >= filteredAd.max_impressions) {
      return NextResponse.json({
        success: true,
        ad: null
      })
    }

    if (filteredAd.max_clicks && filteredAd.current_clicks >= filteredAd.max_clicks) {
      return NextResponse.json({
        success: true,
        ad: null
      })
    }

    return NextResponse.json({
      success: true,
      ad: {
        id: filteredAd.id,
        title: filteredAd.title,
        ad_type: filteredAd.ad_type,
        ad_code: filteredAd.ad_code,
        image_url: filteredAd.image_url,
        link_url: filteredAd.link_url,
        position: filteredAd.position
      }
    })
  } catch (error: any) {
    console.error('광고 조회 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: '광고 조회 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}

