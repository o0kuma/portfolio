'use client'

import { useEffect, useState } from 'react'
import { useVisitorCount } from '@/hooks/useVisitorCount'

export default function VisitorCounter() {
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
      className={[
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/60 backdrop-blur-sm transition-all duration-300',
        pulse ? 'scale-110 text-white/90' : 'scale-100',
      ].join(' ')}
      aria-live="polite"
      aria-label={`누적 방문자 ${shown}명`}
    >
      <span className="text-[10px]" aria-hidden>👁</span>
      <span>누적 방문자 {shown}명</span>
    </span>
  )
}
