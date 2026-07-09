export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

interface PostRow {
  id: number
  title: string
  views: number
  likes: number
}

export async function GET(request: NextRequest) {
  void request
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const result = await dbQuery<PostRow>(
      `SELECT id, title, views, likes FROM posts ORDER BY views DESC LIMIT 5`,
    )
    return NextResponse.json({ posts: result.rows })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/admin/top-posts GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
