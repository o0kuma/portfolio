'use client'

import { useEffect, useState } from 'react'
import { useVisitorCount } from '@/hooks/useVisitorCount'
import { useLanguage } from '@/lib/LanguageContext'

export default function VisitorCounter() {
  const { locale } = useLanguage()
  const { count } = useVisitorCount()

  const [pulse, setPulse] = useState(false)
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (count === displayed) return
    setPulse(true)
    setDisplayed(count)
    const t = setTimeout(() => setPulse(false), 600)
    return () => clearTimeout(t)
  }, [count, displayed])

  // Always show at least 1 (the visitor themselves)
  const shown = Math.max(displayed, 1)

  return (
    <span
      className={`text-xs tabular-nums text-fg-subtle transition-colors duration-300 ${pulse ? 'text-fg' : ''}`}
      aria-live="polite"
    >
      {locale === 'en' ? `${shown.toLocaleString()} visitors` : `누적 방문자 ${shown.toLocaleString()}명`}
    </span>
  )
}
