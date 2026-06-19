export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const [posts, projects, contacts, pending] = await Promise.all([
      dbQuery<{ count: number }>('SELECT COUNT(*)::int AS count FROM posts'),
      dbQuery<{ count: number }>('SELECT COUNT(*)::int AS count FROM projects'),
      dbQuery<{ count: number }>('SELECT COUNT(*)::int AS count FROM contacts'),
      dbQuery<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM contacts WHERE status = 'unread' OR status = 'pending'`,
      ),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts: posts.rows[0]?.count ?? 0,
        totalProjects: projects.rows[0]?.count ?? 0,
        totalContacts: contacts.rows[0]?.count ?? 0,
        pendingContacts: pending.rows[0]?.count ?? 0,
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
