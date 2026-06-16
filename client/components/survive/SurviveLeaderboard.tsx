'use client'

import { fetchSurviveLeaderboard, type SurviveLeaderboardEntry } from '@/lib/survive/leaderboardClient'
import { formatTime } from '@/lib/survive/storage'
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

export default function SurviveLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  const [entries, setEntries] = useState<SurviveLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { scores, error: err } = await fetchSurviveLeaderboard(20)
    setEntries(scores)
    setError(err ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/90 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">랭킹 TOP 20</h2>
        <button
          type="button"
          onClick={() => load()}
          className="text-xs text-slate-500 transition hover:text-cyan-400"
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      {loading && entries.length === 0 && (
        <p className="text-xs text-slate-500">불러오는 중…</p>
      )}

      {error && (
        <p className="text-xs text-amber-400/90">
          {error.includes('마이그레이션') || error.includes('테이블')
            ? 'DB 마이그레이션이 필요합니다.'
            : error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-xs text-slate-500">아직 기록이 없습니다.</p>
      )}

      {entries.length > 0 && (
        <div className="max-h-72 overflow-y-auto text-xs">
          <div
            className="grid grid-cols-[2rem_1fr_3.5rem_2.5rem_3rem_auto] gap-x-2 border-b border-slate-700 pb-1 font-medium text-slate-400"
            aria-hidden
          >
            <span>#</span>
            <span>이름</span>
            <span className="text-right">시간</span>
            <span className="text-right">Lv</span>
            <span className="text-right">처치</span>
            <span className="text-right">날짜</span>
          </div>
          <ol>
            {entries.map((row) => (
              <li
                key={`${row.rank}-${row.createdAt}-${row.timeSec}`}
                className="grid grid-cols-[2rem_1fr_3.5rem_2.5rem_3rem_auto] items-baseline gap-x-2 border-b border-slate-800 py-1.5 last:border-0"
              >
                <span className="font-mono tabular-nums text-slate-400">{row.rank}</span>
                <span className="truncate font-medium text-slate-200">{row.playerName}</span>
                <span className="text-right font-mono tabular-nums text-cyan-300">
                  {formatTime(row.timeSec)}
                </span>
                <span className="text-right font-mono tabular-nums text-slate-300">
                  {row.level}
                </span>
                <span className="text-right font-mono tabular-nums text-slate-300">
                  {row.kills}
                </span>
                <span className="text-right text-[10px] text-slate-500">
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
