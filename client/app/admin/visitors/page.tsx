'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { FiGlobe, FiUsers, FiMapPin, FiCalendar } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'

const VisitorMap = dynamic(() => import('@/components/admin/VisitorMap'), { ssr: false })

interface CountryStat {
  country: string
  country_code: string
  count: number
}

interface RecentVisitor {
  session_id: string
  country: string | null
  country_code: string | null
  city: string | null
  lat: number | null
  lng: number | null
  visited_at: string | null
}

interface MapPoint {
  lat: number
  lng: number
  city: string | null
  country: string | null
  count: number
}

interface VisitorData {
  countries: CountryStat[]
  recentVisitors: RecentVisitor[]
  mapPoints: MapPoint[]
  total: number
}

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

function relativeTime(dateStr: string | null, locale: string): string {
  const en = locale === 'en'
  if (!dateStr) return en ? 'Unknown' : '알 수 없음'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return en ? 'Just now' : '방금 전'
  if (mins < 60) return en ? `${mins}m ago` : `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return en ? `${hours}h ago` : `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return en ? `${days}d ago` : `${days}일 전`
}

type Period = 'today' | 'week' | 'month' | 'all'

const periodLabels: { value: Period; label: string; labelKo: string }[] = [
  { value: 'today', label: 'Today', labelKo: '오늘' },
  { value: 'week', label: 'This Week', labelKo: '이번주' },
  { value: 'month', label: 'This Month', labelKo: '이번달' },
  { value: 'all', label: 'All', labelKo: '전체' },
]

interface HeatmapStat {
  section: string
  views: number
  totalDuration: number
  avgDuration: number
}

export default function AdminVisitorsPage() {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const router = useRouter()
  const [data, setData] = useState<VisitorData | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapStat[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('all')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/visitors?period=${period}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          return null
        }
        return res.json()
      })
      .then((json) => {
        if (json) setData(json)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router, period])

  useEffect(() => {
    fetch('/api/heatmap')
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => setHeatmap(Array.isArray(rows) ? rows : []))
      .catch(() => setHeatmap([]))
  }, [])

  // Derive today count and city count from data
  const todayCount = data?.recentVisitors.filter((v) => {
    if (!v.visited_at) return false
    const d = new Date(v.visited_at)
    const now = new Date()
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  }).length ?? 0

  const citySet = new Set(
    (data?.mapPoints ?? []).map((p) => p.city).filter(Boolean),
  )
  const countryCount = data?.countries.length ?? 0

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="text-neutral-400">{en ? 'Loading...' : '로딩 중...'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6 text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{en ? 'Visitor Stats' : '방문자 현황'}</h1>
        {/* Period filter tabs */}
        <div className="flex gap-1 rounded-lg bg-neutral-900 p-1">
          {periodLabels.map(({ value, label, labelKo }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === value
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {en ? label : labelKo}
            </button>
          ))}
        </div>
      </div>

      {/* 상단 통계 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<FiUsers className="h-5 w-5" />}
          label={en ? 'Total Visitors' : '총 방문자'}
          value={data?.total ?? 0}
          color="text-blue-400"
        />
        <StatCard
          icon={<FiCalendar className="h-5 w-5" />}
          label={en ? 'Today' : '오늘'}
          value={todayCount}
          color="text-green-400"
        />
        <StatCard
          icon={<FiGlobe className="h-5 w-5" />}
          label={en ? 'Countries' : '국가 수'}
          value={countryCount}
          color="text-purple-400"
        />
        <StatCard
          icon={<FiMapPin className="h-5 w-5" />}
          label={en ? 'Cities' : '도시 수'}
          value={citySet.size}
          color="text-orange-400"
        />
      </div>

      {/* 세계 지도 */}
      <div className="mb-6 rounded-xl border border-neutral-800 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-400">{en ? 'Visitor Locations' : '방문자 위치'}</h2>
        <VisitorMap mapPoints={data?.mapPoints ?? []} />
      </div>

      {/* 하단: 국가별 순위 + 최근 방문자 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 국가별 순위 */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-400">{en ? 'Visitors by Country' : '국가별 방문자'}</h2>
          {(data?.countries.length ?? 0) === 0 ? (
            <p className="text-sm text-neutral-500">{en ? 'No data' : '데이터 없음'}</p>
          ) : (
            <ul className="space-y-2">
              {data?.countries.map((c) => (
                <li key={c.country_code} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-base">{countryFlag(c.country_code)}</span>
                    <span className="text-neutral-200">{c.country}</span>
                  </span>
                  <span className="text-sm font-semibold text-neutral-300">{c.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 최근 방문자 */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-400">{en ? 'Recent Visitors' : '최근 방문자'}</h2>
          {(data?.recentVisitors.length ?? 0) === 0 ? (
            <p className="text-sm text-neutral-500">{en ? 'No data' : '데이터 없음'}</p>
          ) : (
            <ul className="space-y-2">
              {data?.recentVisitors.map((v) => (
                <li key={v.session_id} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-200">
                    {[v.city, v.country].filter(Boolean).join(' · ') || (en ? 'Unknown' : '알 수 없음')}
                  </span>
                  <span className="text-xs text-neutral-500">{relativeTime(v.visited_at, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 섹션 히트맵 — 어떤 섹션이 가장 많이 읽혔는지 */}
      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-400">
          {en ? 'Section Heatmap (Views · Avg. Duration)' : '섹션 히트맵 (조회수 · 평균 체류)'}
        </h2>
        {heatmap.length === 0 ? (
          <p className="text-sm text-neutral-500">{en ? 'No data recorded yet.' : '아직 기록된 데이터가 없습니다.'}</p>
        ) : (
          <div className="space-y-2">
            {(() => {
              const max = Math.max(...heatmap.map((h) => h.views), 1)
              return heatmap.map((h) => (
                <div key={h.section} className="flex items-center gap-3 text-xs">
                  <span className="w-28 shrink-0 truncate font-mono text-neutral-300">{h.section}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-neutral-800">
                    <div
                      className="h-full rounded bg-cyan-500/70"
                      style={{ width: `${(h.views / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right font-mono text-neutral-400">
                    {en ? `${h.views}x` : `${h.views}회`}
                  </span>
                  <span className="w-16 shrink-0 text-right font-mono text-neutral-500">
                    {en ? `${(h.avgDuration / 1000).toFixed(1)}s` : `${(h.avgDuration / 1000).toFixed(1)}초`}
                  </span>
                </div>
              ))
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">{label}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  )
}
