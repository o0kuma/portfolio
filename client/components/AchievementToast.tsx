'use client'

import { useEffect, useState } from 'react'
import { Achievement } from '@/lib/achievements'

type Props = {
  achievements: Achievement[]
  onDone: () => void
}

export default function AchievementToast({ achievements, onDone }: Props) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  const current = achievements[idx]

  useEffect(() => {
    if (!current) { onDone(); return }
    setVisible(true)
    const hide = setTimeout(() => setVisible(false), 2800)
    const next = setTimeout(() => {
      setIdx(i => i + 1)
    }, 3200)
    return () => { clearTimeout(hide); clearTimeout(next) }
  }, [idx, current, onDone])

  if (!current) return null

  return (
    <div
      className={`pointer-events-none fixed right-4 top-4 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 shadow-[0_0_24px_rgba(245,158,11,0.2)] backdrop-blur-sm">
        <span className="text-2xl">{current.icon}</span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
            🏆 업적 달성!
          </p>
          <p className="text-sm font-bold text-white">{current.name}</p>
          <p className="text-[11px] text-white/60">{current.desc}</p>
        </div>
      </div>
    </div>
  )
}
