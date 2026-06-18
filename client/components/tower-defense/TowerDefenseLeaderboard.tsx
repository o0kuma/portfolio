'use client'

import {
  fetchTowerDefenseLeaderboard,
  type TowerDefenseLeaderboardEntry,
} from '@/lib/tower-defense/leaderboardClient'
import { useLanguage } from '@/lib/LanguageContext'
import { useCallback, useEffect, useState } from 'react'
import { LeaderboardSkeleton } from '@/components/ui/Skeleton'

function formatDate(iso: string, locale: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function TowerDefenseLeaderboard({
  refreshKey = 0,
  day = null,
}: {
  refreshKey?: number
  /** when set, shows that day's daily-challenge leaderboard */
  day?: string | null
}) {
  const { t, locale } = useLanguage()
  const lb = t.towerDefenseGame.leaderboard
  const [entries, setEntries] = useState<TowerDefenseLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { scores, error: err } = await fetchTowerDefenseLeaderboard(20, day)
    setEntries(scores)
    setError(err ?? null)
    setLoading(false)
  }, [day])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/90 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">{day ? lb.dailyTitle : lb.title}</h2>
        <button
          type="button"
          onClick={() => load()}
          className="text-xs text-slate-500 transition hover:text-amber-400"
          disabled={loading}
        >
          {lb.refresh}
        </button>
      </div>

      {loading && entries.length === 0 && <LeaderboardSkeleton />}

      {error && (
        <p className="text-xs text-amber-400/90">
          {error.includes('마이그레이션') || error.includes('테이블') || error.includes('migration')
            ? lb.dbError
            : error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-xs text-slate-500">{lb.noRecords}</p>
      )}

      {entries.length > 0 && (
        <div className="max-h-72 overflow-y-auto text-xs">
          <div
            className="grid grid-cols-[2rem_1fr_3rem_3rem_auto] gap-x-2 border-b border-slate-700 pb-1 font-medium text-slate-400"
            aria-hidden
          >
            <span>#</span>
            <span>{lb.colName}</span>
            <span className="text-right">{t.towerDefenseGame.waveColumn}</span>
            <span className="text-right">{lb.colKills}</span>
            <span className="text-right">{lb.colDate}</span>
          </div>
          <ol>
            {entries.map((row) => (
              <li
                key={`${row.rank}-${row.createdAt}-${row.wave}`}
                className="grid grid-cols-[2rem_1fr_3rem_3rem_auto] items-baseline gap-x-2 border-b border-slate-800 py-1.5 last:border-0"
              >
                <span className="font-mono tabular-nums text-slate-400">{row.rank}</span>
                <span className="truncate font-medium text-slate-200">{row.playerName}</span>
                <span className="text-right font-mono tabular-nums text-amber-300">{row.wave}</span>
                <span className="text-right font-mono tabular-nums text-slate-300">{row.kills}</span>
                <span className="text-right text-[10px] text-slate-500">
                  {formatDate(row.createdAt, locale)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
