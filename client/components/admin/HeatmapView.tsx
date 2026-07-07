'use client'

import { useEffect, useState, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface SectionStat {
  section: string
  views: number
  totalDuration: number
  avgDuration: number
}

function getHeatColor(ratio: number): string {
  // ratio 0..1: indigo → red
  // interpolate hue from 240 (indigo) to 0 (red)
  const hue = Math.round(240 - ratio * 240)
  const saturation = 70 + Math.round(ratio * 30) // 70%..100%
  const lightness = 55 - Math.round(ratio * 15)  // 55%..40%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

function formatSeconds(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}

export default function HeatmapView() {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [stats, setStats] = useState<SectionStat[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/heatmap', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data: SectionStat[] = await res.json()
      setStats(data)
      setLastUpdated(new Date())
    } catch {
      // silently fail on auto-refresh
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const maxViews = stats.length > 0 ? Math.max(...stats.map((s) => s.views)) : 1

  if (loading) {
    return (
      <div className="p-6 text-neutral-400 text-sm animate-pulse">
        {en ? 'Loading heatmap data...' : '히트맵 데이터 로딩 중...'}
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="p-6 text-neutral-500 text-sm">
        {en ? 'No section data collected yet.' : '아직 수집된 섹션 데이터가 없습니다.'}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">{en ? 'Section Heatmap' : '섹션 히트맵'}</h2>
        {lastUpdated && (
          <span className="text-xs text-neutral-500">
            {en
              ? `Last updated: ${lastUpdated.toLocaleTimeString()} (auto-refreshes every 30s)`
              : `마지막 갱신: ${lastUpdated.toLocaleTimeString()} (30초마다 자동 갱신)`}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {stats.map((stat) => {
          const ratio = maxViews > 0 ? stat.views / maxViews : 0
          const barColor = getHeatColor(ratio)
          const barWidth = `${Math.max(ratio * 100, 2)}%`

          return (
            <div key={stat.section} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-200 font-medium capitalize w-24 truncate">
                  {stat.section}
                </span>
                <span className="text-neutral-400 text-xs">
                  {en ? `${stat.views}x · avg ${formatSeconds(stat.avgDuration)}` : `${stat.views}회 · 평균 ${formatSeconds(stat.avgDuration)}`}
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: barWidth, backgroundColor: barColor }}
                >
                  {ratio > 0.15 && (
                    <span className="text-white text-xs font-semibold">
                      {stat.views}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 pt-2">
        <span className="text-xs text-neutral-500">{en ? 'Low' : '낮음'}</span>
        <div
          className="h-3 flex-1 rounded"
          style={{
            background: 'linear-gradient(to right, hsl(240,70%,55%), hsl(120,85%,45%), hsl(0,100%,40%))',
          }}
        />
        <span className="text-xs text-neutral-500">{en ? 'High' : '높음'}</span>
      </div>
    </div>
  )
}
