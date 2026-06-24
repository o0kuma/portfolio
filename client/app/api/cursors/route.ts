export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

interface CursorEntry {
  id: string; x: number; y: number; color: string; name: string; updatedAt: number
}

const store = new Map<string, CursorEntry>()
const TTL = 10_000 // 10s

function cleanup() {
  const now = Date.now()
  store.forEach((v, k) => { if (now - v.updatedAt > TTL) store.delete(k) })
}

export async function GET() {
  cleanup()
  return NextResponse.json({ cursors: Array.from(store.values()) })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as CursorEntry
  if (!body.id) return NextResponse.json({ ok: false })
  store.set(body.id, { ...body, updatedAt: Date.now() })
  cleanup()
  return NextResponse.json({ ok: true })
}
