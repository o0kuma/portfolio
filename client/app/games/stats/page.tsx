import type { Metadata } from 'next'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import type { GamesStatsResponse } from '@/app/api/games/stats/route'
import SpaceAtmosphere from '@/components/SpaceAtmosphere'

export const metadata: Metadata = {
  title: 'Stats',
  description: 'Overall cumulative stats for Tetris, Survive, and Tower Defense.',
}

function formatTime(totalSec: number): string {
  if (totalSec <= 0) return '0:00'
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

async function fetchStats(): Promise<GamesStatsResponse | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const res = await fetch(`${baseUrl}/api/games/stats`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return (await res.json()) as GamesStatsResponse
  } catch {
    return null
  }
}

type StatRowProps = { label: string; value: string }
function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-neutral-400">{label}</span>
      <span className="font-mono text-sm font-semibold text-neutral-100">{value}</span>
    </div>
  )
}

type GameStatCardProps = {
  emoji: string
  title: string
  href: string
  accentClass: string
  rows: StatRowProps[]
}
function GameStatCard({ emoji, title, href, accentClass, rows }: GameStatCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${accentClass}`}>
          {emoji}
        </div>
        <div>
          <h2 className="text-base font-bold text-neutral-100">{title}</h2>
          <Link
            href={href}
            className="text-xs text-neutral-500 underline-offset-2 hover:text-neutral-300 hover:underline"
          >
            Play
          </Link>
        </div>
      </div>
      <div className="divide-y divide-neutral-800/60">
        {rows.map((row) => (
          <StatRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  )
}

export default async function GamesStatsPage() {
  const stats = await fetchStats()

  return (
    <SpaceAtmosphere className="theme-locked-dark min-h-screen pb-16 text-neutral-100">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#030014]/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-neutral-100"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            Game List
          </Link>
          <span className="text-sm font-semibold text-neutral-100">Game Stats</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-10">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-neutral-100">Game Stats</h1>
          <p className="text-sm text-neutral-400">Overall cumulative score statistics.</p>
        </div>

        {stats === null ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-10 text-center">
            <p className="text-sm text-neutral-400">Unable to load stats. Please try again shortly.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <GameStatCard
              emoji="🧱"
              title="Tetris"
              href="/tetris"
              accentClass="bg-indigo-900/50"
              rows={[
                {
                  label: 'Best Score',
                  value:
                    stats.tetris.bestScore > 0
                      ? stats.tetris.bestScore.toLocaleString()
                      : 'No record',
                },
                {
                  label: 'Best Stage',
                  value:
                    stats.tetris.bestStage > 0 ? `Stage ${stats.tetris.bestStage}` : 'No record',
                },
                {
                  label: 'Total Games',
                  value: `${stats.tetris.totalGames.toLocaleString()}`,
                },
                {
                  label: 'Average Score',
                  value:
                    stats.tetris.avgScore > 0
                      ? stats.tetris.avgScore.toLocaleString()
                      : '-',
                },
              ]}
            />
            <GameStatCard
              emoji="⚔️"
              title="Survive"
              href="/survive"
              accentClass="bg-cyan-900/50"
              rows={[
                {
                  label: 'Best Survival Time',
                  value:
                    stats.survive.bestTimeSec > 0
                      ? formatTime(stats.survive.bestTimeSec)
                      : 'No record',
                },
                {
                  label: 'Best Level',
                  value:
                    stats.survive.bestLevel > 0 ? `Lv.${stats.survive.bestLevel}` : 'No record',
                },
                {
                  label: 'Total Games',
                  value: `${stats.survive.totalGames.toLocaleString()}`,
                },
              ]}
            />
            <GameStatCard
              emoji="🏰"
              title="Tower Defense"
              href="/tower-defense"
              accentClass="bg-amber-900/50"
              rows={[
                {
                  label: 'Best Wave',
                  value:
                    stats.towerDefense.bestWave > 0
                      ? `Wave ${stats.towerDefense.bestWave}`
                      : 'No record',
                },
                {
                  label: 'Total Games',
                  value: `${stats.towerDefense.totalGames.toLocaleString()}`,
                },
              ]}
            />
          </div>
        )}
      </main>
    </SpaceAtmosphere>
  )
}
