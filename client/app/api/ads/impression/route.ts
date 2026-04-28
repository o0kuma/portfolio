export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

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

    const impression = await dbQuery<{ id: string }>(
      `INSERT INTO ad_impressions (advertisement_id, post_id, session_id, position, viewed_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
      [advertisementId, postId || null, sessionId || null, position || null]
    )
    await dbQuery(
      'UPDATE advertisements SET current_impressions = COALESCE(current_impressions, 0) + 1 WHERE id = $1',
      [advertisementId]
    )

    return NextResponse.json({
      success: true,
      impressionId: impression.rows[0]?.id
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

