'use client'

import { useEffect, useRef } from 'react'
import type { MiniGame, ArcadeInput } from '@/lib/arcade/engine'

export default function GameCanvas<TState>({
  game,
  onGameOver,
  resetKey,
}: {
  game: MiniGame<TState>
  onGameOver: (score: number) => void
  resetKey: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<TState>(game.init())
  const inputRef = useRef<ArcadeInput>({ tapped: false, dx: 0 })
  const rafRef = useRef(0)
  const overFiredRef = useRef(false)

  useEffect(() => {
    stateRef.current = game.init()
    overFiredRef.current = false
  }, [game, resetKey])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    window.addEventListener('resize', resize)

    let lastX: number | null = null

    const handleDown = (clientX: number) => {
      lastX = clientX
      inputRef.current.tapped = true
    }
    const handleMove = (clientX: number) => {
      if (lastX == null) return
      const rect = canvas.getBoundingClientRect()
      const dx = (clientX - lastX) / rect.width
      inputRef.current.dx += dx * 2.2
      lastX = clientX
    }
    const handleUp = () => {
      lastX = null
    }

    const onPointerDown = (e: PointerEvent) => handleDown(e.clientX)
    const onPointerMove = (e: PointerEvent) => handleMove(e.clientX)
    const onPointerUp = () => handleUp()

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(48, now - last)
      last = now

      if (!overFiredRef.current) {
        stateRef.current = game.update(stateRef.current, inputRef.current, dt)
        inputRef.current.tapped = false
        inputRef.current.dx = 0

        const W = canvas.width
        const H = canvas.height
        game.render(ctx, stateRef.current, W, H)

        if (game.isOver(stateRef.current)) {
          overFiredRef.current = true
          onGameOver(game.score(stateRef.current))
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, resetKey])

  return (
    <div ref={wrapRef} className="relative h-full w-full touch-none select-none">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
