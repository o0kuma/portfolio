'use client'

import {
  fetchTetrisLeaderboard,
  type LeaderboardEntry,
} from '@/lib/tetris/leaderboardClient'
import { useLanguage } from '@/lib/LanguageContext'
import { useCallback, useEffect, useState } from 'react'
import { LeaderboardSkeleton } from '@/components/ui/Skeleton'

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function TetrisLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  const { t } = useLanguage()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { scores, error: err } = await fetchTetrisLeaderboard(20)
    setEntries(scores)
    setError(err ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t.leaderboard.title}</h2>
        <button
          type="button"
          onClick={() => load()}
          className="text-xs text-slate-500 transition hover:text-primary-600 dark:hover:text-primary-400"
          disabled={loading}
        >
          {t.leaderboard.refresh}
        </button>
      </div>

      {loading && entries.length === 0 && <LeaderboardSkeleton />}

      {error && (
        <p className="text-xs text-amber-700 dark:text-amber-400/90">
          {error.includes('DATABASE') || error.includes('테이블') || error.includes('마이그레이션')
            ? t.leaderboard.dbError
            : error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{t.leaderboard.noRecords}</p>
      )}

      {entries.length > 0 && (
        <div className="max-h-72 overflow-y-auto text-xs">
          <div
            className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_3.5rem_auto] gap-x-1 border-b border-slate-200 pb-1 font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400"
            aria-hidden
          >
            <span>#</span>
            <span>{t.leaderboard.colName}</span>
            <span className="text-right">{t.leaderboard.colStage}</span>
            <span className="text-right">{t.leaderboard.colLines}</span>
            <span className="text-right">{t.leaderboard.colScore}</span>
            <span className="text-right">{t.leaderboard.colDate}</span>
          </div>
          <ol className="space-y-0">
            {entries.map((row) => (
              <li
                key={`${row.rank}-${row.createdAt}-${row.score}`}
                className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_3.5rem_auto] items-baseline gap-x-1 border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800"
              >
                <span className="font-mono tabular-nums text-slate-400">{row.rank}</span>
                <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                  {row.playerName}
                </span>
                <span className="text-right font-mono tabular-nums">{row.stage}</span>
                <span className="text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  {row.lines}
                </span>
                <span className="text-right font-mono tabular-nums text-primary-600 dark:text-primary-400">
                  {row.score.toLocaleString()}
                </span>
                <span className="text-right text-[10px] text-slate-500 dark:text-slate-500">
                  {formatDate(row.createdAt)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
