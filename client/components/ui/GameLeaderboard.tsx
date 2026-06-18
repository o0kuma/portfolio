'use client'

import { useCallback, useEffect, useState } from 'react'

export type GameLeaderboardColumn = {
  key: string
  label: string
  format?: (val: unknown) => string
}

type LeaderboardRow = Record<string, unknown>

type Props = {
  apiPath: string
  refreshKey?: number
  day?: string
  columns: GameLeaderboardColumn[]
  title?: string
  emptyText?: string
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-5 rounded bg-slate-700/60" />
      ))}
    </div>
  )
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function GameLeaderboard({
  apiPath,
  refreshKey = 0,
  day,
  columns,
  title,
  emptyText = '아직 기록이 없습니다',
}: Props) {
  const [entries, setEntries] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams({ limit: '10' })
      if (day) qs.set('day', day)
      const res = await fetch(`${apiPath}?${qs.toString()}`, { cache: 'no-store' })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        setError(data.message ?? res.statusText)
        setEntries([])
      } else {
        const data = (await res.json()) as { scores?: LeaderboardRow[] }
        setEntries(data.scores ?? [])
      }
    } catch {
      setError('네트워크 오류')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [apiPath, day])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const colCount = columns.length
  const gridCols = `2rem 1fr ${Array(colCount).fill('auto').join(' ')}`

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/90 p-4">
      <div className="flex items-center justify-between gap-2">
        {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
        <button
          type="button"
          onClick={() => load()}
          className="ml-auto text-xs text-slate-500 transition hover:text-amber-400"
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      {loading && entries.length === 0 && <LeaderboardSkeleton />}

      {error && (
        <p className="text-xs text-amber-400/90">
          {error.includes('마이그레이션') || error.includes('테이블') || error.includes('migration')
            ? 'DB 마이그레이션이 필요합니다.'
            : error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-xs text-slate-500">{emptyText}</p>
      )}

      {entries.length > 0 && (
        <div className="max-h-72 overflow-y-auto text-xs">
          <div
            className="grid gap-x-2 border-b border-slate-700 pb-1 font-medium text-slate-400"
            style={{ gridTemplateColumns: gridCols }}
            aria-hidden
          >
            <span>#</span>
            <span>이름</span>
            {columns.map((col) => (
              <span key={col.key} className="text-right">
                {col.label}
              </span>
            ))}
          </div>
          <ol>
            {entries.map((row, idx) => {
              const rank = typeof row.rank === 'number' ? row.rank : idx + 1
              const playerName = String(row.player_name ?? row.playerName ?? '—')
              const medal = rank <= 3 ? MEDALS[rank - 1] : null
              return (
                <li
                  key={`${rank}-${String(row.created_at ?? row.createdAt ?? idx)}`}
                  className="grid items-baseline gap-x-2 border-b border-slate-800 py-1.5 last:border-0"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  <span className="font-mono tabular-nums text-slate-400">
                    {medal ?? rank}
                  </span>
                  <span className="truncate font-medium text-slate-200">{playerName}</span>
                  {columns.map((col) => {
                    const val = row[col.key]
                    const display = col.format ? col.format(val) : String(val ?? '')
                    return (
                      <span
                        key={col.key}
                        className="text-right font-mono tabular-nums text-slate-300"
                      >
                        {display}
                      </span>
                    )
                  })}
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
