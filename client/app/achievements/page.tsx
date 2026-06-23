'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import { ALL_ACHIEVEMENTS, getEarned } from '@/lib/achievements'

export default function AchievementsPage() {
  const [earned, setEarned] = useState<Record<string, number>>({})

  useEffect(() => {
    setEarned(getEarned())
  }, [])

  const earnedCount = ALL_ACHIEVEMENTS.filter(a => earned[a.id]).length
  const total = ALL_ACHIEVEMENTS.length
  const progress = total > 0 ? (earnedCount / total) * 100 : 0

  return (
    <div className="min-h-screen bg-neutral-950 pb-16 text-white">
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            게임 목록
          </Link>
          <span className="text-sm font-semibold">업적</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-10">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">업적</h1>
          <p className="mb-4 text-sm text-neutral-400">{earnedCount} / {total} 달성</p>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_ACHIEVEMENTS.map(a => {
            const isEarned = !!earned[a.id]
            return (
              <div
                key={a.id}
                className={`rounded-xl border p-4 transition ${
                  isEarned
                    ? 'border-amber-500/60 bg-amber-500/10 shadow-[0_0_16px_rgba(245,158,11,0.15)]'
                    : 'border-neutral-800 bg-neutral-900 opacity-50 grayscale'
                }`}
              >
                <div className="mb-2 text-3xl">{a.icon}</div>
                <p className="font-semibold text-white">{a.name}</p>
                <p className="mt-1 text-xs text-neutral-400">{a.desc}</p>
                {isEarned && earned[a.id] && (
                  <p className="mt-2 text-[10px] text-amber-400/70">
                    {new Date(earned[a.id]).toLocaleDateString('ko-KR')} 달성
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
