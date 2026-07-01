'use client'

import { useEffect, useRef } from 'react'
import type { MiniGame, ArcadeInput } from '@/lib/arcade/engine'
import { sfx, vibrate } from '@/lib/arcade/sound'
import { burst, stepParticles, renderParticles, type Particle } from '@/lib/arcade/particles'

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
  const inputRef = useRef<ArcadeInput>({ tapped: false, tapX: 0, tapY: 0, dx: 0 })
  const rafRef = useRef(0)
  const overFiredRef = useRef(false)
  const countdownRef = useRef(COUNTDOWN_MS)
  const pausedRef = useRef(paused)
  const particlesRef = useRef<Particle[]>([])
  const lastTapRef = useRef({ x: 0.5, y: 0.5 })
  const shakeRef = useRef(0) // 남은 흔들림 시간(ms)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    stateRef.current = game.init()
    overFiredRef.current = false
    countdownRef.current = COUNTDOWN_MS
    particlesRef.current = []
    shakeRef.current = 0
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

    const handleDown = (clientX: number, clientY: number) => {
      lastX = clientX
      if (countdownRef.current <= 0) {
        const rect = canvas.getBoundingClientRect()
        inputRef.current.tapped = true
        inputRef.current.tapX = (clientX - rect.left) / rect.width
        inputRef.current.tapY = (clientY - rect.top) / rect.height
        lastTapRef.current = { x: inputRef.current.tapX, y: inputRef.current.tapY }
      }
    }
    const handleMove = (clientX: number) => {
      if (lastX == null) return
      const rect = canvas.getBoundingClientRect()
      const dx = (clientX - lastX) / rect.width
      inputRef.current.dx += dx * 1.5
      lastX = clientX
    }
    const handleUp = () => {
      lastX = null
    }

    const onPointerDown = (e: PointerEvent) => handleDown(e.clientX, e.clientY)
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
          const { x, y } = lastTapRef.current
          if (evt === 'perfect') {
            sfx.perfect(); vibrate(25)
            particlesRef.current.push(...burst(x, y, '#fbbf24', 22))
          } else if (evt === 'success') {
            sfx.success(); vibrate(12)
            particlesRef.current.push(...burst(x, y, '#4ade80', 14))
          } else if (evt === 'fail') {
            sfx.fail(); vibrate(60)
            shakeRef.current = 260
          } else if (evt === 'tick') {
            sfx.tick()
          } else if (evt === 'tap') {
            sfx.tap()
          }
        }

        particlesRef.current = stepParticles(particlesRef.current, dt)
        if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - dt)

        const shakeMag = shakeRef.current > 0 ? (shakeRef.current / 260) * 8 : 0
        ctx.save()
        if (shakeMag > 0) {
          ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag)
        }
        game.render(ctx, next, W, H)
        renderParticles(ctx, particlesRef.current, W, H)
        ctx.restore()

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
