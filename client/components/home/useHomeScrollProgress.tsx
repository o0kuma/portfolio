'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

/**
 * 0 = page top, ~1 after ~1.15 viewport heights scrolled — drives WebGL camera / fog (scroll-as-scene).
 */
export function useHomeScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight || 1
      const y = window.scrollY
      const p = Math.min(1, Math.max(0, y / (vh * 1.15)))
      setProgress(p)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return progress
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const fn = () => setReduced(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  return reduced
}

/** Normalized pointer −1..1 for DOM parallax layers. */
export function useViewportPointerTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1
      const h = window.innerHeight || 1
      setTilt({
        x: (e.clientX / w) * 2 - 1,
        y: (e.clientY / h) * 2 - 1,
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduced])

  return { tilt, reduced }
}

type MotionValue = { tilt: { x: number; y: number }; reduced: boolean }

const HomeMotionContext = createContext<MotionValue>({
  tilt: { x: 0, y: 0 },
  reduced: false,
})

/** Single pointer listener for hero + blog cards */
export function HomeMotionProvider({ children }: { children: ReactNode }) {
  const { tilt, reduced } = useViewportPointerTilt()
  return (
    <HomeMotionContext.Provider value={{ tilt, reduced }}>
      {children}
    </HomeMotionContext.Provider>
  )
}

export function useHomeMotion() {
  return useContext(HomeMotionContext)
}
