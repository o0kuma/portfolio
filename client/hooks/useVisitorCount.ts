'use client'

import { useEffect, useRef, useState } from 'react'

export interface UseVisitorCountResult {
  count: number
}

// Refresh cumulative count once per minute — no heartbeat needed
const POLL_INTERVAL_MS = 60_000

function getOrCreateSessionId(): string {
  const KEY = 'visitor_session_id'
  const existing = sessionStorage.getItem(KEY)
  if (existing) return existing

  const id = crypto.randomUUID()
  sessionStorage.setItem(KEY, id)
  return id
}

export function useVisitorCount(): UseVisitorCountResult {
  const [count, setCount] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const sessionId = getOrCreateSessionId()

    const register = async () => {
      try {
        await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
      } catch {
        // network errors are non-fatal
      }
    }

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/visitors')
        if (!res.ok) return
        const data: { count: number } = await res.json()
        setCount(data.count)
      } catch {
        // network errors are non-fatal
      }
    }

    // Register once, then fetch cumulative count
    register().then(() => fetchCount())

    // Poll periodically so the displayed number stays reasonably fresh
    pollRef.current = setInterval(fetchCount, POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  return { count }
}
