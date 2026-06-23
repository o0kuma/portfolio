export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

function isPrivateIp(ip: string): boolean {
  if (!ip) return true
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true
  if (ip.startsWith('10.')) return true
  if (ip.startsWith('192.168.')) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true
  if (ip.startsWith('::ffff:127.')) return true
  return false
}

interface IpApiResponse {
  status: string
  country: string
  countryCode: string
  city: string
  lat: number
  lon: number
}

// POST: register session as a visitor (idempotent — duplicate session_id is silently ignored)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId: string = body?.session_id

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return NextResponse.json({ message: 'session_id가 필요합니다.' }, { status: 400 })
    }

    // Ensure columns exist
    await dbQuery(`ALTER TABLE visitor_count ADD COLUMN IF NOT EXISTS ip TEXT`)
    await dbQuery(`ALTER TABLE visitor_count ADD COLUMN IF NOT EXISTS country TEXT`)
    await dbQuery(`ALTER TABLE visitor_count ADD COLUMN IF NOT EXISTS country_code TEXT`)
    await dbQuery(`ALTER TABLE visitor_count ADD COLUMN IF NOT EXISTS city TEXT`)
    await dbQuery(`ALTER TABLE visitor_count ADD COLUMN IF NOT EXISTS lat FLOAT`)
    await dbQuery(`ALTER TABLE visitor_count ADD COLUMN IF NOT EXISTS lng FLOAT`)
    await dbQuery(
      `ALTER TABLE visitor_count ADD COLUMN IF NOT EXISTS visited_at TIMESTAMPTZ DEFAULT NOW()`,
    )

    // Extract IP
    const ip: string | null =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null

    let country: string | null = null
    let countryCode: string | null = null
    let city: string | null = null
    let lat: number | null = null
    let lng: number | null = null

    // Geo lookup
    if (ip && !isPrivateIp(ip)) {
      try {
        const geoRes = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,lat,lon`,
          { signal: AbortSignal.timeout(3000) },
        )
        if (geoRes.ok) {
          const geo: IpApiResponse = await geoRes.json()
          if (geo.status === 'success') {
            country = geo.country ?? null
            countryCode = geo.countryCode ?? null
            city = geo.city ?? null
            lat = geo.lat ?? null
            lng = geo.lon ?? null
          }
        }
      } catch {
        // ip-api failed, continue without geo
      }
    }

    await dbQuery(
      `INSERT INTO visitor_count (session_id, ip, country, country_code, city, lat, lng, visited_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId.trim(), ip, country, countryCode, city, lat, lng],
    )

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/visitors POST]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

// GET: total cumulative unique visitor count
export async function GET() {
  try {
    const result = await dbQuery<{ count: string }>(
      `SELECT COUNT(*) AS count FROM visitor_count`,
    )

    const count = Number(result.rows[0]?.count ?? 0)
    return NextResponse.json({ count })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/visitors GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
