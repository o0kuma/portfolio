'use client'

import { useEffect, useState } from 'react'
import type { Achievement } from '@/lib/achievements'

type Props = {
  achievements: Achievement[]
  onDone?: () => void
}

export default function AchievementToast({ achievements, onDone }: Props) {
  const [queue, setQueue] = useState<Achievement[]>([])
  const [current, setCurrent] = useState<Achievement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (achievements.length > 0) {
      setQueue((q) => [...q, ...achievements])
    }
  }, [achievements])

  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue
      setCurrent(next)
      setQueue(rest)
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => {
          setCurrent(null)
          onDone?.()
        }, 400)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [current, queue, onDone])

  if (!current) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-amber-500/50 bg-neutral-900 px-5 py-4 shadow-lg shadow-amber-500/10 transition-all duration-400 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <span className="text-2xl">{current.icon}</span>
      <div>
        <p className="text-xs font-semibold text-amber-400">🏆 업적 달성!</p>
        <p className="text-sm font-bold text-white">{current.name}</p>
        <p className="text-xs text-neutral-400">{current.description}</p>
      </div>
    </div>
  )
}
