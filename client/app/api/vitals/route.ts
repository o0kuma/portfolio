import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const metric = await req.json()
  console.log('[vitals]', metric.name, metric.value)
  return NextResponse.json({ ok: true })
}
