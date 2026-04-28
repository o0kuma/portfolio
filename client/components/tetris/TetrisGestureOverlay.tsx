'use client'

import { useCallback, useRef } from 'react'
import {
  LONG_PRESS_MS,
  SWIPE_MIN,
  TAP_MAX,
} from '@/lib/tetris/constants'

type SwipeDir = 'left' | 'right' | 'down' | 'up'

export default function TetrisGestureOverlay({
  onSwipe,
  onTap,
  onLongPress,
  disabled,
}: {
  onSwipe: (dir: SwipeDir) => void
  onTap: () => void
  onLongPress: () => void
  disabled: boolean
}) {
  const startRef = useRef<{
    x: number
    y: number
    pointerId: number
  } | null>(null)
  const longTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longFiredRef = useRef(false)

  const clearLong = useCallback(() => {
    if (longTimerRef.current) {
      clearTimeout(longTimerRef.current)
      longTimerRef.current = null
    }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return
      e.preventDefault()
      longFiredRef.current = false
      startRef.current = {
        x: e.clientX,
        y: e.clientY,
        pointerId: e.pointerId,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      clearLong()
      longTimerRef.current = setTimeout(() => {
        longFiredRef.current = true
        onLongPress()
        startRef.current = null
      }, LONG_PRESS_MS)
    },
    [disabled, clearLong, onLongPress]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = startRef.current
      if (!s || disabled || longFiredRef.current) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (Math.hypot(dx, dy) > TAP_MAX) clearLong()
    },
    [disabled, clearLong]
  )

  const finishPointer = useCallback(
    (e: React.PointerEvent) => {
      clearLong()
      if (disabled) {
        startRef.current = null
        longFiredRef.current = false
        return
      }
      if (longFiredRef.current) {
        longFiredRef.current = false
        startRef.current = null
        return
      }
      const s = startRef.current
      startRef.current = null
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      const dist = Math.hypot(dx, dy)
      if (dist < TAP_MAX) {
        onTap()
        return
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -SWIPE_MIN) onSwipe('left')
        else if (dx > SWIPE_MIN) onSwipe('right')
      } else {
        if (dy > SWIPE_MIN) onSwipe('down')
        else if (dy < -SWIPE_MIN) onSwipe('up')
      }
    },
    [disabled, clearLong, onSwipe, onTap]
  )

  return (
    <div
      className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing md:hidden"
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      aria-hidden
    />
  )
}
