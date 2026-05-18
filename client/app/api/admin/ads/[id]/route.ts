export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

type Ctx = { params: { id: string } }

function checkAdminAuth(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN
  if (!adminToken) return false
  const auth = request.headers.get('authorization') ?? ''
  const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  return provided === adminToken
}

const ALLOWED_COLUMNS = new Set([
  'title', 'description', 'ad_type', 'position',
  'image_url', 'target_url', 'is_active', 'cpc', 'cpm',
])

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const entries = Object.entries(body ?? {}).filter(([k]) => ALLOWED_COLUMNS.has(k))

    if (!entries.length) {
      return NextResponse.json({ success: false, error: '수정할 내용이 없습니다.' }, { status: 400 })
    }

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ')
    const values: unknown[] = entries.map(([, v]) => v)
    values.push(params.id)

    const result = await dbQuery(
      `UPDATE advertisements SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    )

    if (!result.rows[0]) {
      return NextResponse.json({ success: false, error: '광고를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, ad: result.rows[0] })
  } catch (error: any) {
    console.error('[/api/admin/ads/[id] PUT]', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
    }

    await dbQuery('DELETE FROM advertisements WHERE id = $1', [params.id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[/api/admin/ads/[id] DELETE]', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

