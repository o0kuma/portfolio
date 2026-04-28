export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

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

    const adResult = await dbQuery<{ cpc: number; cpm: number }>(
      'SELECT cpc, cpm FROM advertisements WHERE id = $1 LIMIT 1',
      [advertisementId]
    )
    const ad = adResult.rows[0]

    // 수익 계산
    let revenue = 0
    if (ad?.cpc && ad.cpc > 0) {
      revenue = Number(ad.cpc)
    } else if (ad?.cpm && ad.cpm > 0) {
      revenue = Number(ad.cpm) / 1000 // CPM을 클릭당 수익으로 추정
    }

    const click = await dbQuery<{ id: string }>(
      `INSERT INTO ad_clicks (advertisement_id, impression_id, post_id, session_id, clicked_at, revenue)
       VALUES ($1,$2,$3,$4,NOW(),$5) RETURNING id`,
      [advertisementId, impressionId || null, postId || null, sessionId || null, revenue]
    )
    await dbQuery(
      'UPDATE advertisements SET current_clicks = COALESCE(current_clicks, 0) + 1 WHERE id = $1',
      [advertisementId]
    )

    // 노출 기록 업데이트
    if (impressionId) {
      await dbQuery('UPDATE ad_impressions SET is_clicked = true WHERE id = $1', [impressionId])
    }

    return NextResponse.json({
      success: true,
      clickId: click.rows[0]?.id,
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

