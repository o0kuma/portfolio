'use client'

import { useEffect, useRef } from 'react'
import type { MiniGame, ArcadeInput } from '@/lib/arcade/engine'
import { sfx, vibrate } from '@/lib/arcade/sound'

const COUNTDOWN_MS = 2200 // "3, 2, 1" 표시 시간

export default function GameCanvas<TState>({
  game,
  onGameOver,
  resetKey,
  paused = false,
}: {
  game: MiniGame<TState>
  onGameOver: (score: number) => void
  resetKey: number
  paused?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<TState>(game.init())
  const inputRef = useRef<ArcadeInput>({ tapped: false, dx: 0 })
  const rafRef = useRef(0)
  const overFiredRef = useRef(false)
  const countdownRef = useRef(COUNTDOWN_MS)
  const pausedRef = useRef(paused)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    stateRef.current = game.init()
    overFiredRef.current = false
    countdownRef.current = COUNTDOWN_MS
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
      if (countdownRef.current <= 0) inputRef.current.tapped = true
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

      const W = canvas.width
      const H = canvas.height

      if (pausedRef.current) {
        game.render(ctx, stateRef.current, W, H)
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('일시정지', W / 2, H / 2)
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      if (countdownRef.current > 0 && !overFiredRef.current) {
        countdownRef.current = Math.max(0, countdownRef.current - dt)
        game.render(ctx, stateRef.current, W, H)
        ctx.fillStyle = 'rgba(0,0,0,0.45)'
        ctx.fillRect(0, 0, W, H)
        const label = countdownRef.current > COUNTDOWN_MS * (2 / 3)
          ? '3' : countdownRef.current > COUNTDOWN_MS * (1 / 3)
          ? '2' : countdownRef.current > 40 ? '1' : 'GO!'
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 56px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, W / 2, H / 2)
        ctx.textBaseline = 'alphabetic'
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      if (!overFiredRef.current) {
        const prev = stateRef.current
        const next = game.update(prev, inputRef.current, dt)
        stateRef.current = next
        inputRef.current.tapped = false
        inputRef.current.dx = 0

        const evt = game.soundEvent?.(prev, next)
        if (evt) {
          if (evt === 'perfect') { sfx.perfect(); vibrate(25) }
          else if (evt === 'success') { sfx.success(); vibrate(12) }
          else if (evt === 'fail') { sfx.fail(); vibrate(60) }
          else if (evt === 'tick') sfx.tick()
          else if (evt === 'tap') sfx.tap()
        }

        game.render(ctx, next, W, H)

        if (game.isOver(next)) {
          overFiredRef.current = true
          onGameOver(game.score(next))
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
