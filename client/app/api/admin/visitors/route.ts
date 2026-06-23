export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

interface CountryRow {
  country: string
  country_code: string
  count: string
}

interface RecentVisitorRow {
  session_id: string
  country: string | null
  country_code: string | null
  city: string | null
  lat: number | null
  lng: number | null
  visited_at: string | null
}

interface MapPointRow {
  lat: number
  lng: number
  city: string | null
  country: string | null
  count: string
}

interface TotalRow {
  count: string
}

export async function GET(request: NextRequest) {
  void request
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const [countriesResult, recentResult, mapPointsResult, totalResult] = await Promise.allSettled([
      dbQuery<CountryRow>(
        `SELECT country, country_code, COUNT(*) as count
         FROM visitor_count
         WHERE country IS NOT NULL
         GROUP BY country, country_code
         ORDER BY count DESC
         LIMIT 20`,
      ),
      dbQuery<RecentVisitorRow>(
        `SELECT session_id, country, country_code, city, lat, lng, visited_at
         FROM visitor_count
         WHERE visited_at IS NOT NULL
         ORDER BY visited_at DESC
         LIMIT 20`,
      ),
      dbQuery<MapPointRow>(
        `SELECT lat, lng, city, country, COUNT(*) as count
         FROM visitor_count
         WHERE lat IS NOT NULL AND lng IS NOT NULL
         GROUP BY lat, lng, city, country
         LIMIT 500`,
      ),
      dbQuery<TotalRow>(`SELECT COUNT(*) as count FROM visitor_count`),
    ])

    const countries =
      countriesResult.status === 'fulfilled'
        ? countriesResult.value.rows.map((r) => ({
            country: r.country,
            country_code: r.country_code,
            count: Number(r.count),
          }))
        : []

    const recentVisitors =
      recentResult.status === 'fulfilled' ? recentResult.value.rows : []

    const mapPoints =
      mapPointsResult.status === 'fulfilled'
        ? mapPointsResult.value.rows.map((r) => ({
            lat: r.lat,
            lng: r.lng,
            city: r.city,
            country: r.country,
            count: Number(r.count),
          }))
        : []

    const total =
      totalResult.status === 'fulfilled'
        ? Number(totalResult.value.rows[0]?.count ?? 0)
        : 0

    return NextResponse.json({ countries, recentVisitors, mapPoints, total })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/admin/visitors GET]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
