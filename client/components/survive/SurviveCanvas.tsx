'use client'

import { useEffect, useRef } from 'react'
import type { SurviveEngine } from '@/lib/survive/engine'
import type { GameStatus } from '@/lib/survive/types'

type Props = {
  engineRef: React.MutableRefObject<SurviveEngine | null>
  status: GameStatus
}

const ENEMY_COLORS: Record<string, string> = {
  slime: '#34d399',
  fast: '#f472b6',
  tank: '#a78bfa',
}

/** Imperative canvas renderer. Runs its own rAF reading the engine's mutable state. */
export default function SurviveCanvas({ engineRef, status }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      sizeRef.current = { w, h, dpr }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let raf = 0
    const draw = () => {
      const { w, h, dpr } = sizeRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // backdrop
      ctx.fillStyle = '#0b1020'
      ctx.fillRect(0, 0, w, h)

      const e = engineRef.current
      if (e) {
        const camX = e.player.x - w / 2
        const camY = e.player.y - h / 2

        // grid
        const grid = 80
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth = 1
        const startX = -((camX % grid) + grid) % grid
        const startY = -((camY % grid) + grid) % grid
        ctx.beginPath()
        for (let x = startX; x <= w; x += grid) {
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
        }
        for (let y = startY; y <= h; y += grid) {
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
        }
        ctx.stroke()

        const sx = (wx: number) => wx - camX
        const sy = (wy: number) => wy - camY

        // gems
        ctx.fillStyle = '#22d3ee'
        for (const g of e.gems) {
          ctx.beginPath()
          ctx.arc(sx(g.x), sy(g.y), 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // blast ring (recent)
        for (const f of e.floats) {
          if (f.color !== 'blast') continue
          const prog = 1 - f.lifeMs / 280
          ctx.strokeStyle = `rgba(96,165,250,${0.5 * (1 - prog)})`
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.arc(sx(f.x), sy(f.y), e.blastRadius * prog, 0, Math.PI * 2)
          ctx.stroke()
        }

        // enemies
        for (const en of e.enemies) {
          ctx.fillStyle = ENEMY_COLORS[en.kind] ?? '#34d399'
          ctx.beginPath()
          ctx.arc(sx(en.x), sy(en.y), en.radius, 0, Math.PI * 2)
          ctx.fill()
          // hp sliver for damaged enemies
          if (en.hp < en.maxHp) {
            const bw = en.radius * 2
            const ratio = Math.max(0, en.hp / en.maxHp)
            ctx.fillStyle = 'rgba(0,0,0,0.5)'
            ctx.fillRect(sx(en.x) - en.radius, sy(en.y) - en.radius - 7, bw, 3)
            ctx.fillStyle = '#f87171'
            ctx.fillRect(sx(en.x) - en.radius, sy(en.y) - en.radius - 7, bw * ratio, 3)
          }
        }

        // projectiles
        ctx.fillStyle = '#fde047'
        for (const pr of e.projectiles) {
          ctx.beginPath()
          ctx.arc(sx(pr.x), sy(pr.y), pr.radius, 0, Math.PI * 2)
          ctx.fill()
        }

        // orbs
        if (e.orbCount > 0) {
          for (let i = 0; i < e.orbCount; i++) {
            const ang = e.orbRenderAngle + (Math.PI * 2 * i) / e.orbCount
            const ox = sx(e.player.x + Math.cos(ang) * e.orbOrbitRadius)
            const oy = sy(e.player.y + Math.sin(ang) * e.orbOrbitRadius)
            ctx.fillStyle = '#67e8f9'
            ctx.beginPath()
            ctx.arc(ox, oy, 9, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // player
        const px = sx(e.player.x)
        const py = sy(e.player.y)
        const blink = e.player.invulnMs > 0 && Math.floor(e.player.invulnMs / 80) % 2 === 0
        ctx.fillStyle = blink ? '#fca5a5' : '#60a5fa'
        ctx.beginPath()
        ctx.arc(px, py, 14, 0, Math.PI * 2)
        ctx.fill()
        // facing nub
        ctx.fillStyle = '#dbeafe'
        ctx.beginPath()
        ctx.arc(px + Math.cos(e.player.facing) * 9, py + Math.sin(e.player.facing) * 9, 4, 0, Math.PI * 2)
        ctx.fill()

        if (status === 'paused') {
          ctx.fillStyle = 'rgba(11,16,32,0.55)'
          ctx.fillRect(0, 0, w, h)
        }
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [engineRef, status])

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}
