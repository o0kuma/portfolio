'use client'

import { useEffect, useRef } from 'react'
import type { TowerDefenseEngine } from '@/lib/tower-defense/engine'
import type { GameStatus, TowerKind } from '@/lib/tower-defense/types'
import {
  GRID_COLS,
  GRID_ROWS,
  PALETTE,
  TILE,
  WAYPOINTS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  buildPathCellSet,
} from '@/lib/tower-defense/constants'

type Props = {
  engineRef: React.MutableRefObject<TowerDefenseEngine | null>
  status: GameStatus
  onTap: (wx: number, wy: number) => void
}

const TOWER_COLORS: Record<TowerKind, string> = {
  pulse: PALETTE.pulse,
  splash: PALETTE.splash,
  frost: PALETTE.frost,
  beam: PALETTE.beam,
}

const PATH_SET = buildPathCellSet()

/** Imperative pixel-retro canvas renderer. Runs its own rAF reading engine state. */
export default function TowerDefenseCanvas({ engineRef, status, onTap }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  // layout: world->screen scale + letterbox offset, plus dpr
  const viewRef = useRef({ scale: 1, ox: 0, oy: 0, dpr: 1, w: 0, h: 0 })
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap

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
      const scale = Math.min(w / WORLD_WIDTH, h / WORLD_HEIGHT)
      const ox = (w - WORLD_WIDTH * scale) / 2
      const oy = (h - WORLD_HEIGHT * scale) / 2
      viewRef.current = { scale, ox, oy, dpr, w, h }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let raf = 0
    const draw = () => {
      const { scale, ox, oy, dpr, w, h } = viewRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false

      // backdrop (letterbox)
      ctx.fillStyle = PALETTE.bg
      ctx.fillRect(0, 0, w, h)

      const e = engineRef.current
      const shakeX = e && e.shake > 0 ? (Math.random() - 0.5) * e.shake : 0
      const shakeY = e && e.shake > 0 ? (Math.random() - 0.5) * e.shake : 0

      // world transform: integer-snapped for crisp pixels
      ctx.setTransform(dpr, 0, 0, dpr, Math.round((ox + shakeX) * dpr) / dpr, Math.round((oy + shakeY) * dpr) / dpr)
      ctx.scale(scale, scale)

      // grass checkerboard
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const onPath = PATH_SET.has(`${c},${r}`)
          ctx.fillStyle = onPath
            ? PALETTE.road
            : (c + r) % 2 === 0
              ? PALETTE.grass
              : PALETTE.grassAlt
          ctx.fillRect(c * TILE, r * TILE, TILE, TILE)
        }
      }

      // road edge highlight
      ctx.fillStyle = PALETTE.roadEdge
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (!PATH_SET.has(`${c},${r}`)) continue
          ctx.fillRect(c * TILE + 2, r * TILE + 2, TILE - 4, 3)
        }
      }

      // entrance / exit markers
      const entry = WAYPOINTS[0]
      const exit = WAYPOINTS[WAYPOINTS.length - 1]
      ctx.fillStyle = '#4ade80'
      ctx.fillRect(entry.x - 6, entry.y - 6, 12, 12)
      ctx.fillStyle = '#f87171'
      ctx.fillRect(exit.x - 6, exit.y - 6, 12, 12)

      if (e) {
        // range preview for the currently inspected tower
        const insp = e.selectedTowerId != null
          ? e.towers.find((t) => t.id === e.selectedTowerId)
          : null
        if (insp) {
          ctx.strokeStyle = 'rgba(255,255,255,0.35)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(insp.x, insp.y, insp.range * e.rangeMul, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,255,255,0.06)'
          ctx.fillRect(insp.col * TILE, insp.row * TILE, TILE, TILE)
        }

        // ring place-effects
        for (const f of e.floats) {
          if (f.color !== 'ring') continue
          const prog = 1 - f.lifeMs / 360
          ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - prog)})`
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(f.x, f.y, 6 + prog * 28, 0, Math.PI * 2)
          ctx.stroke()
        }

        // towers (chunky blocks)
        for (const t of e.towers) {
          const col = TOWER_COLORS[t.kind]
          const half = 13
          // base
          ctx.fillStyle = '#11182e'
          ctx.fillRect(t.x - half - 1, t.y - half - 1, (half + 1) * 2, (half + 1) * 2)
          ctx.fillStyle = col
          ctx.fillRect(t.x - half, t.y - half, half * 2, half * 2)
          // inner pixel detail
          ctx.fillStyle = '#0e1020'
          ctx.fillRect(t.x - 4, t.y - 4, 8, 8)
          // barrel
          ctx.save()
          ctx.translate(t.x, t.y)
          ctx.rotate(t.aimAngle)
          ctx.fillStyle = t.flashMs > 0 ? '#ffffff' : col
          ctx.fillRect(0, -3, half + (t.flashMs > 0 ? 8 : 4), 6)
          ctx.restore()
          // level pips
          for (let i = 0; i < t.level; i++) {
            ctx.fillStyle = PALETTE.gold
            ctx.fillRect(t.x - half + i * 5, t.y + half + 2, 4, 3)
          }
        }

        // projectiles
        for (const pr of e.projectiles) {
          ctx.fillStyle = TOWER_COLORS[pr.kind]
          const sz = pr.radius * 1.6
          ctx.fillRect(Math.round(pr.x - sz / 2), Math.round(pr.y - sz / 2), sz, sz)
          if (pr.kind === 'beam') {
            ctx.fillStyle = 'rgba(192,132,252,0.4)'
            ctx.fillRect(Math.round(pr.x - sz), Math.round(pr.y - sz), sz * 2, sz * 2)
          }
        }

        // enemies (blocky)
        for (const en of e.enemies) {
          const slowed = en.slowMs > 0
          let col: string = PALETTE.enemyNormal
          if (en.kind === 'fast') col = PALETTE.enemyFast
          else if (en.kind === 'tank') col = PALETTE.enemyTank
          else if (en.kind === 'boss') col = PALETTE.enemyBoss
          const rad = en.radius
          ctx.fillStyle = '#0b0f1f'
          ctx.fillRect(en.x - rad - 1, en.y - rad - 1, (rad + 1) * 2, (rad + 1) * 2)
          ctx.fillStyle = col
          ctx.fillRect(en.x - rad, en.y - rad, rad * 2, rad * 2)
          if (slowed) {
            ctx.fillStyle = 'rgba(94,234,212,0.5)'
            ctx.fillRect(en.x - rad, en.y - rad, rad * 2, rad * 2)
          }
          // eyes
          ctx.fillStyle = '#0b0f1f'
          ctx.fillRect(en.x - rad / 2 - 1, en.y - 2, 3, 3)
          ctx.fillRect(en.x + rad / 2 - 2, en.y - 2, 3, 3)
          // hp bar
          if (en.hp < en.maxHp || en.kind === 'boss') {
            const bw = rad * 2
            const ratio = Math.max(0, en.hp / en.maxHp)
            ctx.fillStyle = PALETTE.hpBack
            ctx.fillRect(en.x - rad, en.y - rad - 6, bw, 3)
            ctx.fillStyle = PALETTE.hp
            ctx.fillRect(en.x - rad, en.y - rad - 6, bw * ratio, 3)
          }
        }

        // particles
        for (const p of e.particles) {
          const a = Math.max(0, p.lifeMs / p.maxLifeMs)
          ctx.globalAlpha = a
          ctx.fillStyle = p.color
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
        }
        ctx.globalAlpha = 1

        // floating text
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        for (const f of e.floats) {
          if (f.color === 'ring') continue
          ctx.globalAlpha = Math.min(1, f.lifeMs / 400)
          ctx.fillStyle = f.color
          ctx.fillText(f.text, f.x, f.y)
        }
        ctx.globalAlpha = 1
        ctx.textAlign = 'left'
      }

      if (status === 'paused' || status === 'upgrade') {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = 'rgba(14,16,32,0.6)'
        ctx.fillRect(0, 0, w, h)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [engineRef, status])

  // tap -> world coords
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handle = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const { scale, ox, oy } = viewRef.current
      const px = clientX - rect.left - ox
      const py = clientY - rect.top - oy
      const wx = px / scale
      const wy = py / scale
      if (wx < 0 || wy < 0 || wx > WORLD_WIDTH || wy > WORLD_HEIGHT) return
      onTapRef.current(wx, wy)
    }
    const onClick = (ev: MouseEvent) => handle(ev.clientX, ev.clientY)
    const onTouch = (ev: TouchEvent) => {
      if (ev.touches.length === 0 && ev.changedTouches.length > 0) {
        const t = ev.changedTouches[0]
        ev.preventDefault()
        handle(t.clientX, t.clientY)
      }
    }
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchend', onTouch, { passive: false })
    return () => {
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchend', onTouch)
    }
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block touch-none" />
    </div>
  )
}
