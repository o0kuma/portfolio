export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

export interface GeoLocation {
  lat: number
  lng: number
  country: string | null
  countryCode: string | null
  count: number
}

export async function GET() {
  try {
    const result = await dbQuery<{
      lat: number
      lng: number
      country: string | null
      country_code: string | null
      count: string
    }>(`
      SELECT
        ROUND(lat::numeric, 1) AS lat,
        ROUND(lng::numeric, 1) AS lng,
        country,
        country_code,
        COUNT(*) AS count
      FROM visitor_count
      WHERE lat IS NOT NULL AND lng IS NOT NULL
      GROUP BY ROUND(lat::numeric, 1), ROUND(lng::numeric, 1), country, country_code
      ORDER BY count DESC
      LIMIT 200
    `)

    const locations: GeoLocation[] = result.rows.map((r) => ({
      lat: Number(r.lat),
      lng: Number(r.lng),
      country: r.country,
      countryCode: r.country_code,
      count: Number(r.count),
    }))

    return NextResponse.json({ locations })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/visitors/geo]', msg)
    return NextResponse.json({ locations: [] }, { status: 200 })
  }
}
