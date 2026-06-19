export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

type Ctx = { params: Promise<{ id: string; commentId: string }> }

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const { commentId } = await params
    await dbQuery('DELETE FROM threaded_comments WHERE id = $1', [commentId])
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/posts/[id]/comments/[commentId] DELETE]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
