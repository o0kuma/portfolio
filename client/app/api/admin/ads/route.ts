export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export async function GET() {
  try {
    const result = await dbQuery('SELECT * FROM advertisements ORDER BY created_at DESC')
    return NextResponse.json({ success: true, ads: result.rows })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

