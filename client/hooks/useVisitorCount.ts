'use client'

import { useEffect, useRef, useState } from 'react'

export interface UseVisitorCountResult {
  count: number
}

const HEARTBEAT_INTERVAL_MS = 10_000
const POLL_INTERVAL_MS = 10_000

function getOrCreateSessionId(): string {
  const KEY = 'visitor_session_id'
  const existing = sessionStorage.getItem(KEY)
  if (existing) return existing

  // crypto.randomUUID() is available in all modern browsers
  const id = crypto.randomUUID()
  sessionStorage.setItem(KEY, id)
  return id
}

export function useVisitorCount(): UseVisitorCountResult {
  const [count, setCount] = useState(0)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const sessionId = getOrCreateSessionId()

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
      } catch {
        // network errors are non-fatal for heartbeat
      }
    }

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/visitors')
        if (!res.ok) return
        const data: { count: number } = await res.json()
        setCount(data.count)
      } catch {
        // network errors are non-fatal for polling
      }
    }

    // Immediate calls on mount
    sendHeartbeat()
    fetchCount()

    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
    pollRef.current = setInterval(fetchCount, POLL_INTERVAL_MS)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  return { count }
}
