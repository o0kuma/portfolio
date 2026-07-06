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

function lighten(hex: string, amt: number): string {
  const c = hex.replace('#', '')
  const r = Math.min(255, parseInt(c.slice(0, 2), 16) + amt)
  const g = Math.min(255, parseInt(c.slice(2, 4), 16) + amt)
  const b = Math.min(255, parseInt(c.slice(4, 6), 16) + amt)
  return `rgb(${r},${g},${b})`
}
function darken(hex: string, amt: number): string {
  const c = hex.replace('#', '')
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - amt)
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - amt)
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - amt)
  return `rgb(${r},${g},${b})`
}

/** Two cartoon eyes with pupils that glance toward (lookX, lookY) unit vector. */
function drawEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spacing: number,
  eyeR: number,
  lookX: number,
  lookY: number,
) {
  for (const sign of [-1, 1]) {
    const ex = cx + sign * spacing
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(ex, cy, eyeR, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0b0f1f'
    ctx.beginPath()
    ctx.arc(ex + lookX * eyeR * 0.5, cy + lookY * eyeR * 0.5, eyeR * 0.55, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Player hero: a round-headed blue buddy with a little antenna and glancing eyes. */
function drawHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: number,
  blink: boolean,
  now: number,
) {
  const r = 14
  const bob = Math.sin(now / 200) * 1.2
  const cy = y + bob
  const base = blink ? '#fca5a5' : '#60a5fa'
  const lookX = Math.cos(facing)
  const lookY = Math.sin(facing)

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.beginPath()
  ctx.ellipse(x, y + r * 0.9, r * 0.85, r * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()

  // antenna
  ctx.strokeStyle = darken(base, 20)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, cy - r * 0.7)
  ctx.lineTo(x + lookX * 2, cy - r * 1.5)
  ctx.stroke()
  ctx.fillStyle = '#fde047'
  ctx.beginPath()
  ctx.arc(x + lookX * 2, cy - r * 1.5, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // body
  ctx.fillStyle = darken(base, 28)
  ctx.beginPath()
  ctx.arc(x, cy + 1, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = base
  ctx.beginPath()
  ctx.arc(x, cy, r, 0, Math.PI * 2)
  ctx.fill()
  // belly highlight
  ctx.fillStyle = lighten(base, 34)
  ctx.beginPath()
  ctx.ellipse(x - r * 0.28, cy - r * 0.4, r * 0.42, r * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()

  // eyes look toward facing
  drawEyes(ctx, x + lookX * 2, cy - 1, 4.5, 3, lookX, lookY)
}

/** Slime enemy: squishy blob with a wobble, shine, eyes + tiny mouth. */
function drawSlimeChar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  col: string,
  now: number,
  seed: number,
  lookX: number,
  lookY: number,
) {
  const t = Math.sin(now / 190 + seed)
  const rx = radius * (1 + t * 0.08)
  const ry = radius * (1 - t * 0.08)
  ctx.fillStyle = darken(col, 34)
  ctx.beginPath()
  ctx.ellipse(x, y + 1.5, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = lighten(col, 40)
  ctx.beginPath()
  ctx.ellipse(x - rx * 0.3, y - ry * 0.45, rx * 0.4, ry * 0.24, 0, 0, Math.PI * 2)
  ctx.fill()
  drawEyes(ctx, x, y - ry * 0.1, radius * 0.32, radius * 0.22, lookX, lookY)
  // mouth
  ctx.strokeStyle = '#0b0f1f'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(x, y + radius * 0.28, radius * 0.22, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()
}

/** Fast enemy: a zippy bat/imp with little ears/wings, big eyes, jitter. */
function drawFastChar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  col: string,
  now: number,
  seed: number,
  face: number,
  lookX: number,
  lookY: number,
) {
  const flap = Math.sin(now / 60 + seed) * 0.4
  // wings (behind body)
  ctx.fillStyle = darken(col, 18)
  for (const sign of [-1, 1]) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(face + sign * (0.9 + flap))
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(-radius * 1.2, -radius * 0.6 * sign, -radius * 1.6, 0)
    ctx.quadraticCurveTo(-radius * 1.1, radius * 0.5 * sign, 0, 0)
    ctx.fill()
    ctx.restore()
  }
  // ears
  ctx.fillStyle = darken(col, 10)
  for (const sign of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x + sign * radius * 0.45, y - radius * 0.5)
    ctx.lineTo(x + sign * radius * 0.9, y - radius * 1.15)
    ctx.lineTo(x + sign * radius * 0.1, y - radius * 0.75)
    ctx.closePath()
    ctx.fill()
  }
  // body
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = lighten(col, 30)
  ctx.beginPath()
  ctx.ellipse(x - radius * 0.25, y - radius * 0.35, radius * 0.35, radius * 0.22, 0, 0, Math.PI * 2)
  ctx.fill()
  // big eyes
  drawEyes(ctx, x, y - radius * 0.05, radius * 0.34, radius * 0.28, lookX, lookY)
}

/** Tank enemy: bulky armored golem — squarish plated body, heavy brow, eyes. */
function drawTankChar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  col: string,
  lookX: number,
  lookY: number,
) {
  const r = radius
  // shadow already drawn by caller
  // arms/shoulders
  ctx.fillStyle = darken(col, 30)
  for (const sign of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(x + sign * r * 0.95, y + r * 0.1, r * 0.42, 0, Math.PI * 2)
    ctx.fill()
  }
  // body plate (rounded square)
  const s = r * 0.95
  ctx.fillStyle = '#0b0f1f'
  ctx.fillRect(x - s - 1, y - s - 1, (s + 1) * 2, (s + 1) * 2)
  ctx.fillStyle = col
  ctx.fillRect(x - s, y - s, s * 2, s * 2)
  ctx.fillStyle = lighten(col, 26)
  ctx.fillRect(x - s, y - s, s * 2, 2)
  ctx.fillRect(x - s, y - s, 2, s * 2)
  ctx.fillStyle = darken(col, 34)
  ctx.fillRect(x - s, y + s - 2, s * 2, 2)
  ctx.fillRect(x + s - 2, y - s, 2, s * 2)
  // rivets
  ctx.fillStyle = darken(col, 20)
  for (const dx of [-s * 0.6, s * 0.6]) {
    for (const dy of [-s * 0.6, s * 0.6]) {
      ctx.fillRect(x + dx - 1, y + dy - 1, 2, 2)
    }
  }
  // heavy brow
  ctx.fillStyle = darken(col, 40)
  ctx.fillRect(x - s * 0.7, y - s * 0.45, s * 1.4, 3)
  // eyes (glowing)
  drawEyes(ctx, x, y, r * 0.36, r * 0.2, lookX, lookY)
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
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
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
          const dx = e.player.x - en.x
          const dy = e.player.y - en.y
          const d = Math.hypot(dx, dy) || 1
          const lookX = dx / d
          const lookY = dy / d
          const face = Math.atan2(dy, dx)
          // enemies have no stable id; derive a smooth per-enemy phase from position
          const seed = en.x * 0.13 + en.y * 0.17
          const cx = sx(en.x)
          const cy = sy(en.y)

          // ground shadow
          ctx.fillStyle = 'rgba(0,0,0,0.28)'
          ctx.beginPath()
          ctx.ellipse(cx, cy + en.radius * 0.9, en.radius * 0.85, en.radius * 0.32, 0, 0, Math.PI * 2)
          ctx.fill()

          if (en.isBoss) {
            // Boss: menacing armored red/gold golem, scaled up tank silhouette.
            drawTankChar(ctx, cx, cy, en.radius, '#dc2626', lookX, lookY)
            // gold crown spikes
            ctx.fillStyle = '#fbbf24'
            for (let i = -1; i <= 1; i++) {
              ctx.beginPath()
              ctx.moveTo(cx + i * en.radius * 0.5 - 3, cy - en.radius)
              ctx.lineTo(cx + i * en.radius * 0.5, cy - en.radius - 8)
              ctx.lineTo(cx + i * en.radius * 0.5 + 3, cy - en.radius)
              ctx.closePath()
              ctx.fill()
            }
            // Boss HP bar (wider/taller)
            const bw = en.radius * 2
            const ratio = Math.max(0, en.hp / en.maxHp)
            ctx.fillStyle = 'rgba(0,0,0,0.6)'
            ctx.fillRect(cx - en.radius, cy - en.radius - 12, bw, 5)
            ctx.fillStyle = '#fbbf24'
            ctx.fillRect(cx - en.radius, cy - en.radius - 12, bw * ratio, 5)
          } else {
            const col = ENEMY_COLORS[en.kind] ?? '#34d399'
            if (en.kind === 'fast') drawFastChar(ctx, cx, cy, en.radius, col, now, seed, face, lookX, lookY)
            else if (en.kind === 'tank') drawTankChar(ctx, cx, cy, en.radius, col, lookX, lookY)
            else drawSlimeChar(ctx, cx, cy, en.radius, col, now, seed, lookX, lookY)
            // hp sliver for damaged enemies
            if (en.hp < en.maxHp) {
              const bw = en.radius * 2
              const ratio = Math.max(0, en.hp / en.maxHp)
              ctx.fillStyle = 'rgba(0,0,0,0.5)'
              ctx.fillRect(cx - en.radius, cy - en.radius - 9, bw, 3)
              ctx.fillStyle = '#f87171'
              ctx.fillRect(cx - en.radius, cy - en.radius - 9, bw * ratio, 3)
            }
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
        drawHero(ctx, px, py, e.player.facing, blink, now)

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
