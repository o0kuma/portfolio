export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { getAiStats } from '@/lib/aiStats'

export async function GET() {
  const ok = await isAdminAuthenticated()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const stats = getAiStats()
  return NextResponse.json({
    success: true,
    stats: {
      totalRequests: stats.total,
      requestsToday: stats.today,
    },
  })
}
