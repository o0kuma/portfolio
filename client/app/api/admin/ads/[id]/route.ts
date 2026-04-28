export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbQuery('DELETE FROM advertisements WHERE id = $1', [params.id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

