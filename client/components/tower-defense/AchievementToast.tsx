'use client'

import { useEffect, useState } from 'react'
import { Achievement } from '@/lib/tower-defense/achievements'
import { useLanguage } from '@/lib/LanguageContext'

type Props = {
  achievements: Achievement[]   // newly unlocked ones
  onDone: () => void
}

export default function AchievementToast({ achievements, onDone }: Props) {
  const { locale } = useLanguage()
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
      className={`pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl border border-amber-400/40 bg-slate-900/95 px-4 py-3 shadow-[0_0_24px_rgba(251,191,36,0.2)] backdrop-blur-sm">
        <span className="text-2xl">{current.emoji}</span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
            Achievement Unlocked
          </p>
          <p className="text-sm font-bold text-white">
            {locale === 'ko' ? current.nameKo : current.nameEn}
          </p>
          <p className="text-[11px] text-white/60">
            {locale === 'ko' ? current.descKo : current.descEn}
          </p>
        </div>
      </div>
    </div>
  )
}
