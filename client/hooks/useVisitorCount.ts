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

const EXCLUDE_KEY = 'visitor_exclude'

// Self-exclude this browser from visitor counting.
// Visit the site with ?notrack=1 to enable, ?notrack=0 to disable.
// The flag persists in localStorage so this device is never counted.
function resolveExcluded(): boolean {
  try {
    const params = new URLSearchParams(window.location.search)
    const notrack = params.get('notrack')
    if (notrack === '1' || notrack === 'true') {
      localStorage.setItem(EXCLUDE_KEY, '1')
    } else if (notrack === '0' || notrack === 'false') {
      localStorage.removeItem(EXCLUDE_KEY)
    }
    return localStorage.getItem(EXCLUDE_KEY) === '1'
  } catch {
    return false
  }
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

    // Register once (unless this browser is self-excluded), then fetch count
    if (resolveExcluded()) {
      fetchCount()
    } else {
      register().then(() => fetchCount())
    }

    // Poll periodically so the displayed number stays reasonably fresh
    pollRef.current = setInterval(fetchCount, POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  return { count }
}
