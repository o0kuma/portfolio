'use client'

import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, getEarned, type EarnedEntry } from '@/lib/achievements'
import SpaceAtmosphere from '@/components/SpaceAtmosphere'

export default function AchievementsPage() {
  const [earned, setEarned] = useState<EarnedEntry[]>([])

  useEffect(() => {
    setEarned(getEarned())
  }, [])

  const earnedMap = new Map(earned.map((e) => [e.id, e.earnedAt]))
  const count = earned.length

  return (
    <SpaceAtmosphere className="theme-locked-dark min-h-screen pb-16 text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#030014]/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            게임으로
          </Link>
          <span className="text-sm font-semibold">업적</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-10">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">🏆 업적</h1>
          <p className="mb-4 text-neutral-400">게임을 플레이하며 업적을 달성해보세요</p>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-neutral-400">{count} / {ACHIEVEMENTS.length} 달성</span>
            <span className="font-semibold text-amber-400">{Math.round((count / ACHIEVEMENTS.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-700"
              style={{ width: `${(count / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((ach) => {
            const earnedAt = earnedMap.get(ach.id)
            const isEarned = !!earnedAt
            return (
              <div
                key={ach.id}
                className={`relative rounded-xl border p-5 transition ${
                  isEarned
                    ? 'border-amber-500/60 bg-amber-950/20 shadow-md shadow-amber-500/10'
                    : 'border-neutral-800 bg-neutral-900 grayscale opacity-50'
                }`}
              >
                <div className="mb-3 text-3xl">{ach.icon}</div>
                <p className={`text-sm font-bold ${isEarned ? 'text-amber-300' : 'text-neutral-300'}`}>{ach.name}</p>
                <p className="mt-1 text-xs text-neutral-500">{ach.description}</p>
                {earnedAt && (
                  <p className="mt-2 text-[10px] text-amber-600">
                    {new Date(earnedAt).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </SpaceAtmosphere>
  )
}
