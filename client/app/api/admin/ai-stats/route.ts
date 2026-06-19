import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { getAiStats, recordAiRequest } from '@/lib/aiStats'

export async function GET() {
  const ok = await isAdminAuthenticated()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getAiStats())
}
