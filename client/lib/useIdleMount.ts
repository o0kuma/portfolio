import { useEffect, useState } from 'react'

/**
 * Delays mounting non-critical UI (decorative widgets) until the browser is
 * idle or a fallback timeout passes, so their JS fetch/hydration doesn't
 * compete with the critical path during initial page load.
 */
export function useIdleMount(timeoutMs = 2000): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: timeoutMs })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setReady(true), timeoutMs)
    return () => clearTimeout(id)
  }, [timeoutMs])

  return ready
}
