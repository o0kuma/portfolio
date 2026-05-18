'use client'

import { useEffect, useState } from 'react'
import { useVisitorCount } from '@/hooks/useVisitorCount'

export default function VisitorCounter() {
  const { count, status } = useVisitorCount()

  // Pulse animation trigger on count change
  const [pulse, setPulse] = useState(false)
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (count === displayed) return
    setPulse(true)
    setDisplayed(count)
    const t = setTimeout(() => setPulse(false), 600)
    return () => clearTimeout(t)
  }, [count, displayed])

  if (status === 'error' || (status === 'disconnected' && count === 0)) {
    return null
  }

  const dot =
    status === 'connected'
      ? 'bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]'
      : status === 'connecting'
        ? 'bg-yellow-400 animate-pulse'
        : 'bg-gray-500'

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/60 backdrop-blur-sm transition-all duration-300',
        pulse ? 'scale-110 text-white/90' : 'scale-100',
      ].join(' ')}
      aria-live="polite"
      aria-label={`현재 ${displayed}명 접속 중`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      {status === 'connecting' ? (
        <span>연결 중…</span>
      ) : (
        <span>{displayed}명 접속 중</span>
      )}
    </span>
  )
}
