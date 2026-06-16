'use client'

import { useRef, useState } from 'react'
import type { Vec } from '@/lib/survive/types'

const MAX_DIST = 56

/**
 * Dynamic floating joystick. Touch/click anywhere on the overlay to anchor it;
 * drag to steer. Emits a normalized-ish vector (magnitude ≤ 1) via onChange.
 */
export default function SurviveJoystick({ onChange }: { onChange: (v: Vec) => void }) {
  const [origin, setOrigin] = useState<Vec | null>(null)
  const [knob, setKnob] = useState<Vec>({ x: 0, y: 0 })
  const activeId = useRef<number | null>(null)

  const begin = (e: React.PointerEvent) => {
    activeId.current = e.pointerId
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setKnob({ x: 0, y: 0 })
  }

  const move = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId || !origin) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const dx = e.clientX - rect.left - origin.x
    const dy = e.clientY - rect.top - origin.y
    const d = Math.hypot(dx, dy)
    const clamped = Math.min(d, MAX_DIST)
    const ang = Math.atan2(dy, dx)
    const kx = Math.cos(ang) * clamped
    const ky = Math.sin(ang) * clamped
    setKnob({ x: kx, y: ky })
    onChange({ x: kx / MAX_DIST, y: ky / MAX_DIST })
  }

  const end = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId) return
    activeId.current = null
    setOrigin(null)
    setKnob({ x: 0, y: 0 })
    onChange({ x: 0, y: 0 })
  }

  return (
    <div
      className="absolute inset-0 z-20 touch-none"
      style={{ touchAction: 'none' }}
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {origin && (
        <>
          <div
            className="pointer-events-none absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25 bg-white/5"
            style={{ left: origin.x, top: origin.y }}
          />
          <div
            className="pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
            style={{ left: origin.x + knob.x, top: origin.y + knob.y }}
          />
        </>
      )}
    </div>
  )
}
