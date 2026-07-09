export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    const result = await dbQuery('SELECT * FROM advertisements ORDER BY created_at DESC')
    return NextResponse.json({ success: true, ads: result.rows })
  } catch (error: any) {
    console.error('[/api/admin/ads GET]', error.message)
    return NextResponse.json({ success: false, error: '광고 목록을 불러오지 못했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.title?.trim() || !body.ad_type?.trim() || !body.position?.trim()) {
      return NextResponse.json(
        { success: false, error: '제목, 광고 타입, 위치는 필수입니다.' },
        { status: 400 }
      )
    }

    const result = await dbQuery(
      `INSERT INTO advertisements
         (title, description, ad_type, position, image_url, target_url, is_active, cpc, cpm)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        body.title.trim(),
        body.description?.trim() ?? '',
        body.ad_type.trim(),
        body.position.trim(),
        body.image_url?.trim() ?? null,
        body.target_url?.trim() ?? null,
        body.is_active ?? true,
        Number(body.cpc) || 0,
        Number(body.cpm) || 0,
      ]
    )

    return NextResponse.json({ success: true, ad: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    console.error('[/api/admin/ads POST]', error.message)
    return NextResponse.json({ success: false, error: '광고를 생성하지 못했습니다.' }, { status: 500 })
  }
}

