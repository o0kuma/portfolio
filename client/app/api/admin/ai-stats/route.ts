export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

let aiRequestCount = 0
let aiRequestsToday = 0
let lastResetDate = new Date().toDateString()

export function incrementAiStats() {
  const today = new Date().toDateString()
  if (today !== lastResetDate) {
    aiRequestsToday = 0
    lastResetDate = today
  }
  aiRequestCount++
  aiRequestsToday++
}

export async function GET() {
  const today = new Date().toDateString()
  if (today !== lastResetDate) {
    aiRequestsToday = 0
    lastResetDate = today
  }
  return NextResponse.json({
    success: true,
    stats: {
      totalRequests: aiRequestCount,
      requestsToday: aiRequestsToday,
    }
  })
}
