'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

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
        <div key={i} className="h-5 rounded bg-white/10" />
      ))}
    </div>
  )
}

export default function GameLeaderboard({
  apiPath,
  refreshKey = 0,
  day,
  columns,
  title,
  emptyText = '아직 기록이 없습니다',
}: Props) {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [entries, setEntries] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams({ limit: '10' })
      if (day) qs.set('day', day)
      const separator = apiPath.includes('?') ? '&' : '?'
      const res = await fetch(`${apiPath}${separator}${qs.toString()}`, { cache: 'no-store' })
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
    <div className="flex w-full flex-col gap-3 rounded-xl border-2 border-ink bg-ink p-5 text-paper shadow-[5px_5px_0_#BFD6FF]">
      <div className="flex items-center justify-between gap-2">
        {title && <h2 className="text-sm font-extrabold text-paper">{title}</h2>}
        <button
          type="button"
          onClick={() => load()}
          className="ml-auto text-xs text-[#cfc9bb] transition-colors hover:text-paper"
          disabled={loading}
        >
          {en ? 'Refresh' : '새로고침'}
        </button>
      </div>

      {loading && entries.length === 0 && <LeaderboardSkeleton />}

      {error && (
        <p className="text-xs text-cat-food">
          {/* API messages are Korean-only; show a generic line in English mode. */}
          {en
            ? 'Could not load rankings.'
            : error.includes('마이그레이션') || error.includes('테이블') || error.includes('migration')
              ? 'DB 마이그레이션이 필요합니다.'
              : error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-xs text-[#cfc9bb]">{emptyText}</p>
      )}

      {entries.length > 0 && (
        <div className="max-h-72 overflow-y-auto text-xs">
          <div
            className="grid gap-x-2 border-b border-[#444] pb-1 font-medium text-[#cfc9bb]"
            style={{ gridTemplateColumns: gridCols }}
            aria-hidden
          >
            <span>#</span>
            <span>{en ? 'Name' : '이름'}</span>
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
              return (
                <li
                  key={`${rank}-${String(row.created_at ?? row.createdAt ?? idx)}`}
                  className="grid items-baseline gap-x-2 border-b border-[#444] py-1.5 last:border-0"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  <span className={`tabular-nums ${rank === 1 ? 'font-black text-cat-post' : rank <= 3 ? 'font-black text-paper' : 'text-[#cfc9bb]'}`}>{rank}</span>
                  <span className="truncate font-medium text-paper">{playerName}</span>
                  {columns.map((col) => {
                    const val = row[col.key]
                    const display = col.format ? col.format(val) : String(val ?? '')
                    return (
                      <span
                        key={col.key}
                        className="text-right tabular-nums text-paper"
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
