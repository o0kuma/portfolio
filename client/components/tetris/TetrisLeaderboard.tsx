'use client'

import {
  fetchTetrisLeaderboard,
  type LeaderboardEntry,
} from '@/lib/tetris/leaderboardClient'
import { useCallback, useEffect, useState } from 'react'

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
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">랭킹 TOP 20</h2>
        <button
          type="button"
          onClick={() => load()}
          className="text-xs text-slate-500 transition hover:text-primary-600 dark:hover:text-primary-400"
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      {loading && entries.length === 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">불러오는 중…</p>
      )}

      {error && (
        <p className="text-xs text-amber-700 dark:text-amber-400/90">
          {error.includes('DATABASE') || error.includes('테이블') || error.includes('마이그레이션')
            ? 'DB 연결 또는 마이그레이션이 필요합니다.'
            : error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">아직 기록이 없습니다.</p>
      )}

      {entries.length > 0 && (
        <div className="max-h-72 overflow-y-auto text-xs">
          <div
            className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_3.5rem_auto] gap-x-1 border-b border-slate-200 pb-1 font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400"
            aria-hidden
          >
            <span>#</span>
            <span>이름</span>
            <span className="text-right">단계</span>
            <span className="text-right">줄</span>
            <span className="text-right">점수</span>
            <span className="text-right">날짜</span>
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
