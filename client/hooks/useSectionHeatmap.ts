'use client'

import { useEffect, useRef } from 'react'

const MIN_DURATION_MS = 5000

export function useSectionHeatmap(section: string) {
  const ref = useRef<HTMLElement | null>(null)
  const enterTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            enterTimeRef.current = Date.now()
          } else {
            if (enterTimeRef.current !== null) {
              const duration = Date.now() - enterTimeRef.current
              enterTimeRef.current = null

              if (duration >= MIN_DURATION_MS) {
                navigator.sendBeacon(
                  '/api/heatmap',
                  new Blob(
                    [JSON.stringify({ section, duration })],
                    { type: 'application/json' }
                  )
                )
              }
            }
          }
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)

    const handleUnload = () => {
      if (enterTimeRef.current !== null) {
        const duration = Date.now() - enterTimeRef.current
        if (duration >= MIN_DURATION_MS) {
          navigator.sendBeacon(
            '/api/heatmap',
            new Blob(
              [JSON.stringify({ section, duration })],
              { type: 'application/json' }
            )
          )
        }
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      observer.disconnect()
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [section])

  return ref
}
