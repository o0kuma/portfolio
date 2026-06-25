export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

interface TrailPoint {
  x: number
  y: number
  t: number
}

interface CursorEntry {
  id: string
  x: number
  y: number
  color: string
  name: string
  updatedAt: number
  trail: TrailPoint[]
}

const store = new Map<string, CursorEntry>()
const TTL = 12_000 // 12s
const MAX_TRAIL = 8

function cleanup() {
  const now = Date.now()
  store.forEach((v, k) => {
    if (now - v.updatedAt > TTL) store.delete(k)
  })
}

export async function GET() {
  cleanup()
  return NextResponse.json({ cursors: Array.from(store.values()) })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<CursorEntry>
  if (!body.id) return NextResponse.json({ ok: false })

  const prev = store.get(body.id)
  const trail: TrailPoint[] = prev
    ? [
        ...prev.trail.slice(-(MAX_TRAIL - 1)),
        { x: prev.x, y: prev.y, t: prev.updatedAt },
      ]
    : []

  store.set(body.id, {
    id: body.id,
    x: body.x ?? 0,
    y: body.y ?? 0,
    color: body.color ?? '#22d3ee',
    name: body.name ?? '방문자',
    updatedAt: Date.now(),
    trail,
  })

  cleanup()
  return NextResponse.json({ ok: true })
}
