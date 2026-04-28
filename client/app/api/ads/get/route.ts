export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

// 광고 조회 API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'banner'
    const position = searchParams.get('position') || 'top'
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []

    const today = new Date().toISOString().split('T')[0]
    const adsResult = await dbQuery<any>(
      `SELECT * FROM advertisements
       WHERE is_active = true
         AND ad_type = $1
         AND (position = $2 OR position IS NULL)
         AND (start_date IS NULL OR start_date <= $3)
         AND (end_date IS NULL OR end_date >= $3)
       ORDER BY priority DESC, created_at DESC
       LIMIT 1`,
      [type, position, today]
    )
    const ads = adsResult.rows

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

