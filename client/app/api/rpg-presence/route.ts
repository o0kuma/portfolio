export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

interface PresenceEntry {
  id: string
  x: number
  y: number
  dir: number
  name: string
  updatedAt: number
}

// In-memory, same pattern as /api/cursors — fine for a single Next.js
// process; entries expire fast so stale tabs don't linger as ghosts.
const store = new Map<string, PresenceEntry>()
const TTL = 10_000 // 10s

function cleanup() {
  const now = Date.now()
  store.forEach((v, k) => {
    if (now - v.updatedAt > TTL) store.delete(k)
  })
}

export async function GET() {
  cleanup()
  return NextResponse.json({ visitors: Array.from(store.values()) })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<PresenceEntry>
  if (!body.id) return NextResponse.json({ ok: false })

  store.set(body.id, {
    id: body.id,
    x: body.x ?? 0,
    y: body.y ?? 0,
    dir: body.dir ?? 0,
    name: body.name ?? 'Guest',
    updatedAt: Date.now(),
  })

  cleanup()
  return NextResponse.json({ ok: true })
}
