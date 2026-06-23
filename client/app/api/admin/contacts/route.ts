export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { dbQuery } from '@/lib/neon-server'

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const result = await dbQuery(
      `SELECT id, name, email, subject, message, status, created_at
       FROM contacts
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    return NextResponse.json({ success: true, contacts: result.rows })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
