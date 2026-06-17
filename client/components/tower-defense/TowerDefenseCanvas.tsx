'use client'

import { useEffect, useRef } from 'react'
import type { TowerDefenseEngine } from '@/lib/tower-defense/engine'
import type { Enemy, GameStatus, Projectile, Tower, TowerKind } from '@/lib/tower-defense/types'
import { TOWER_DEFS } from '@/lib/tower-defense/towers'
import {
  BOSS_EVERY,
  GRID_COLS,
  GRID_ROWS,
  PALETTE,
  TILE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  buildPathCellSet,
  buildWaypoints,
  PATH_CELLS,
  mapDefById,
} from '@/lib/tower-defense/constants'
import type { Vec, WaveEvent } from '@/lib/tower-defense/types'

type Props = {
  engineRef: React.MutableRefObject<TowerDefenseEngine | null>
  status: GameStatus
  /** active map id; changing it rebuilds the static road background */
  mapId: string
  onTap: (wx: number, wy: number) => void
  /** localized banner labels (events keyed by WaveEvent name) */
  labels: {
    boss: string
    wave: string
    evolved: string
    events: { rush: string; armored: string; swarm: string; elite: string }
  }
}

const TOWER_COLORS: Record<TowerKind, string> = {
  pulse: PALETTE.pulse,
  splash: PALETTE.splash,
  frost: PALETTE.frost,
  beam: PALETTE.beam,
  blizzard: PALETTE.blizzard,
  railgun: PALETTE.railgun,
  tempest: PALETTE.tempest,
  prism: PALETTE.prism,
}

const EVOLVED = new Set<TowerKind>(['blizzard', 'railgun', 'tempest', 'prism'])

// Active map geometry, set by the component effect before each render frame so
// module-level draw helpers (background, portals, enemy facing) stay in sync
// with the engine's chosen map (Feature 3).
let activeWaypoints: Vec[] = buildWaypoints(PATH_CELLS)
let activePathSet: Set<string> = buildPathCellSet(PATH_CELLS)

/** Deterministic hash-based PRNG so decorative variation never flickers. */
function hash01(n: number): number {
  let h = (n ^ 0x9e3779b9) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  h = (h ^ (h >>> 16)) >>> 0
  return h / 0xffffffff
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

/** Imperative pixel-retro canvas renderer. Runs its own rAF reading engine state. */
export default function TowerDefenseCanvas({ engineRef, status, mapId, onTap, labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef({ scale: 1, ox: 0, oy: 0, dpr: 1, w: 0, h: 0 })
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap
  const labelsRef = useRef(labels)
  labelsRef.current = labels
  const hoverRef = useRef<{ col: number; row: number } | null>(null)
  const waveBannerRef = useRef<{ wave: number; t: number; event: WaveEvent }>({
    wave: 0,
    t: 0,
    event: null,
  })

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

    // sync active map geometry for the module-level draw helpers (Feature 3)
    const cells = mapDefById(mapId).pathCells
    activeWaypoints = buildWaypoints(cells)
    activePathSet = buildPathCellSet(cells)

    // static background cached to an offscreen canvas (rebuilt per map)
    const bgCanvas = document.createElement('canvas')
    const bgCtx = bgCanvas.getContext('2d')
    if (bgCtx) buildBackground(bgCtx, bgCanvas)

    let raf = 0
    const draw = () => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const { scale, ox, oy, dpr, w, h } = viewRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false

      ctx.fillStyle = '#05060c'
      ctx.fillRect(0, 0, w, h)

      const e = engineRef.current
      const shakeX = e && e.shake > 0 ? (Math.random() - 0.5) * e.shake : 0
      const shakeY = e && e.shake > 0 ? (Math.random() - 0.5) * e.shake : 0

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        Math.round((ox + shakeX) * dpr) / dpr,
        Math.round((oy + shakeY) * dpr) / dpr,
      )
      ctx.scale(scale, scale)

      ctx.drawImage(bgCanvas, 0, 0)

      // boss-wave ambiance: subtle pulsing red tint over the world
      if (e) {
        const bossActive =
          e.enemies.some((en) => en.kind === 'boss') ||
          (e.wave > 0 && e.wave % BOSS_EVERY === 0 && e.enemies.length > 0)
        if (bossActive) {
          const pulse = 0.06 + 0.04 * (0.5 + 0.5 * Math.sin(now / 420))
          ctx.fillStyle = `rgba(248,80,80,${pulse})`
          ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
        }
      }

      drawPortal(ctx, activeWaypoints[0].x, activeWaypoints[0].y, '#4ade80', now)
      const ex = activeWaypoints[activeWaypoints.length - 1]
      drawPortal(ctx, ex.x, ex.y, '#f87171', now)

      if (e) {
        // build placement preview
        if (e.selected && hoverRef.current) {
          const { col, row } = hoverRef.current
          const onPath = activePathSet.has(`${col},${row}`)
          const occupied = e.towers.some((t) => t.col === col && t.row === row)
          const afford = e.gold >= TOWER_DEFS[e.selected].cost
          const placeable = !onPath && !occupied && afford
          const x = col * TILE
          const y = row * TILE
          ctx.fillStyle = placeable ? 'rgba(74,222,128,0.22)' : 'rgba(248,113,113,0.22)'
          ctx.fillRect(x, y, TILE, TILE)
          ctx.strokeStyle = placeable ? '#4ade80' : '#f87171'
          ctx.lineWidth = 1.5
          ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2)
          drawRange(
            ctx,
            x + TILE / 2,
            y + TILE / 2,
            TOWER_DEFS[e.selected].range * e.rangeMul,
            now,
            placeable,
          )
        }

        const insp =
          e.selectedTowerId != null
            ? e.towers.find((t) => t.id === e.selectedTowerId)
            : null
        if (insp) drawRange(ctx, insp.x, insp.y, insp.range * e.rangeMul, now, true)

        // evolution link hints
        const links = e.evolveLinks()
        if (links.length) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          const pulse = 0.4 + 0.35 * (0.5 + 0.5 * Math.sin(now / 240))
          for (const { a, b } of links) {
            ctx.strokeStyle = `rgba(253,224,71,${pulse})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            const s = 2 + Math.sin(now / 160) * 1.5
            ctx.fillStyle = `rgba(255,255,255,${pulse})`
            ctx.fillRect(mx - s / 2, my - s / 2, s, s)
          }
          ctx.restore()
          ctx.globalAlpha = 1
        }

        // ring place/upgrade effects
        for (const f of e.floats) {
          if (f.color !== 'ring') continue
          const prog = 1 - f.lifeMs / 360
          ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - prog)})`
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(f.x, f.y, 6 + prog * 30, 0, Math.PI * 2)
          ctx.stroke()
        }

        for (const t of e.towers) drawTower(ctx, t, now)

        // instant beams
        if (e.beams.length) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          for (const b of e.beams) {
            const a = b.lifeMs / b.maxLifeMs
            // prism refraction: hue-shift the outer glow over its short life
            let outer = b.color
            if (b.color === PALETTE.prism) {
              const hue = (200 + (1 - a) * 120) % 360
              outer = `hsl(${hue},90%,72%)`
            }
            ctx.globalAlpha = a
            ctx.strokeStyle = outer
            ctx.lineWidth = b.width + 5
            ctx.beginPath()
            ctx.moveTo(b.x1, b.y1)
            ctx.lineTo(b.x2, b.y2)
            ctx.stroke()
            // bright white core line
            ctx.lineWidth = Math.max(1, b.width - 1)
            ctx.strokeStyle = '#ffffff'
            ctx.stroke()
            // impact flash at the far end
            ctx.globalAlpha = a * 0.9
            ctx.fillStyle = outer
            ctx.beginPath()
            ctx.arc(b.x2, b.y2, 5 + (1 - a) * 6, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(b.x2, b.y2, 2.5, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
          ctx.globalAlpha = 1
        }

        // projectiles w/ trail + additive glow (per-kind silhouette)
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (const pr of e.projectiles) {
          drawProjectile(ctx, pr, now)
        }
        ctx.restore()
        ctx.globalAlpha = 1

        for (const en of e.enemies) drawEnemy(ctx, en, now, labelsRef.current.boss)

        // particles (additive)
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (const p of e.particles) {
          ctx.globalAlpha = Math.max(0, p.lifeMs / p.maxLifeMs)
          ctx.fillStyle = p.color
          if (p.w != null && p.h != null) {
            // spinning rectangular shard
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rot ?? 0)
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
            ctx.restore()
          } else {
            ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
          }
        }
        ctx.restore()
        ctx.globalAlpha = 1

        // floating text with dark outline
        ctx.textAlign = 'center'
        for (const f of e.floats) {
          if (f.color === 'ring') continue
          const big = !f.text.startsWith('+') && Number(f.text) > 40
          ctx.globalAlpha = Math.min(1, f.lifeMs / 400)
          ctx.font = `${big ? 14 : 10}px "Courier New", monospace`
          ctx.fillStyle = 'rgba(0,0,0,0.85)'
          ctx.fillText(f.text, f.x + 1, f.y + 1)
          ctx.fillStyle = f.color
          ctx.fillText(f.text, f.x, f.y)
        }
        ctx.globalAlpha = 1
        ctx.textAlign = 'left'

        // evolution "EVOLVED!" pop (localized, position from engine)
        if (e.evolveFlash) {
          const ev = e.evolveFlash
          const p = Math.min(1, (900 - ev.ms) / 200)
          const rise = (1 - ev.ms / 900) * 14
          ctx.save()
          ctx.globalAlpha = Math.min(1, ev.ms / 300)
          ctx.textAlign = 'center'
          ctx.font = `bold ${10 + p * 4}px "Courier New", monospace`
          ctx.fillStyle = 'rgba(0,0,0,0.8)'
          ctx.fillText(labelsRef.current.evolved, ev.x + 1, ev.y - rise + 1)
          ctx.fillStyle = PALETTE.gold
          ctx.fillText(labelsRef.current.evolved, ev.x, ev.y - rise)
          ctx.restore()
          ctx.globalAlpha = 1
          ctx.textAlign = 'left'
        }

        // wave banner
        if (e.wave > waveBannerRef.current.wave) {
          waveBannerRef.current = { wave: e.wave, t: now, event: e.activeEvent }
        }
        const evt = waveBannerRef.current.event
        const evtLabel = evt ? labelsRef.current.events[evt] : null
        drawWaveBanner(ctx, waveBannerRef.current, now, labelsRef.current.wave, evtLabel)
      }

      if (status === 'paused' || status === 'upgrade') {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = 'rgba(8,10,22,0.55)'
        ctx.fillRect(0, 0, w, h)
      }

      // boss-death full-screen white flash (screen-space, after world reset)
      if (e && e.flash > 0) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.85, e.flash)})`
        ctx.fillRect(0, 0, w, h)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [engineRef, status, mapId])

  // pointer -> world coords (tap + hover)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const toWorld = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const { scale, ox, oy } = viewRef.current
      return {
        wx: (clientX - rect.left - ox) / scale,
        wy: (clientY - rect.top - oy) / scale,
      }
    }
    const handle = (clientX: number, clientY: number) => {
      const { wx, wy } = toWorld(clientX, clientY)
      if (wx < 0 || wy < 0 || wx > WORLD_WIDTH || wy > WORLD_HEIGHT) return
      onTapRef.current(wx, wy)
    }
    const onClick = (ev: MouseEvent) => handle(ev.clientX, ev.clientY)
    const onMove = (ev: MouseEvent) => {
      const { wx, wy } = toWorld(ev.clientX, ev.clientY)
      if (wx < 0 || wy < 0 || wx > WORLD_WIDTH || wy > WORLD_HEIGHT) {
        hoverRef.current = null
        return
      }
      hoverRef.current = { col: Math.floor(wx / TILE), row: Math.floor(wy / TILE) }
    }
    const onLeave = () => {
      hoverRef.current = null
    }
    const onTouch = (ev: TouchEvent) => {
      if (ev.touches.length === 0 && ev.changedTouches.length > 0) {
        const t = ev.changedTouches[0]
        ev.preventDefault()
        handle(t.clientX, t.clientY)
      }
    }
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('touchend', onTouch, { passive: false })
    return () => {
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('touchend', onTouch)
    }
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block touch-none" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// drawing helpers
// ---------------------------------------------------------------------------

function buildBackground(c: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  canvas.width = WORLD_WIDTH
  canvas.height = WORLD_HEIGHT
  c.imageSmoothingEnabled = false

  const grad = c.createLinearGradient(0, 0, 0, WORLD_HEIGHT)
  grad.addColorStop(0, '#0a0c1a')
  grad.addColorStop(1, '#161d33')
  c.fillStyle = grad
  c.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (activePathSet.has(`${col},${r}`)) continue
      const x = col * TILE
      const y = r * TILE
      const checker = (col + r) % 2 === 0
      c.fillStyle = checker ? PALETTE.grass : PALETTE.grassAlt
      c.fillRect(x, y, TILE, TILE)
      c.fillStyle = 'rgba(255,255,255,0.05)'
      c.fillRect(x, y, TILE, 1)
      c.fillRect(x, y, 1, TILE)
      c.fillStyle = 'rgba(0,0,0,0.22)'
      c.fillRect(x, y + TILE - 1, TILE, 1)
      c.fillRect(x + TILE - 1, y, 1, TILE)
      const hh = hash01(col * 73 + r * 131)
      if (hh > 0.78) {
        const dx = x + 6 + Math.floor(hash01(col * 17 + r * 7) * (TILE - 12))
        const dy = y + 6 + Math.floor(hash01(col * 31 + r * 11) * (TILE - 12))
        c.fillStyle = checker ? lighten(PALETTE.grass, 14) : lighten(PALETTE.grassAlt, 14)
        c.fillRect(dx, dy, 2, 2)
        if (hh > 0.92) c.fillRect(dx + 3, dy + 1, 1, 2)
      }
    }
  }

  // road
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!activePathSet.has(`${col},${r}`)) continue
      const x = col * TILE
      const y = r * TILE
      c.fillStyle = PALETTE.road
      c.fillRect(x, y, TILE, TILE)
      c.fillStyle = darken(PALETTE.road, 18)
      if (!activePathSet.has(`${col},${r - 1}`)) c.fillRect(x, y, TILE, 3)
      if (!activePathSet.has(`${col},${r + 1}`)) c.fillRect(x, y + TILE - 3, TILE, 3)
      if (!activePathSet.has(`${col - 1},${r}`)) c.fillRect(x, y, 3, TILE)
      if (!activePathSet.has(`${col + 1},${r}`)) c.fillRect(x + TILE - 3, y, 3, TILE)
      c.fillStyle = lighten(PALETTE.road, 22)
      c.fillRect(x + TILE / 2 - 4, y + TILE / 2 - 4, 8, 8)
      const h2 = hash01(col * 53 + r * 97 + 999)
      if (h2 > 0.6) {
        c.fillStyle = h2 > 0.8 ? lighten(PALETTE.road, 12) : darken(PALETTE.road, 10)
        const dx = x + 4 + Math.floor(hash01(col * 19 + r * 5) * (TILE - 8))
        const dy = y + 4 + Math.floor(hash01(col * 23 + r * 3) * (TILE - 8))
        c.fillRect(dx, dy, 2, 2)
      }
    }
  }

  // directional chevrons toward exit
  c.fillStyle = 'rgba(255,235,190,0.18)'
  for (let i = 0; i < activeWaypoints.length - 1; i++) {
    const a = activeWaypoints[i]
    const b = activeWaypoints[i + 1]
    const ang = Math.atan2(b.y - a.y, b.x - a.x)
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    const steps = Math.max(1, Math.floor(len / 28))
    for (let s = 1; s < steps; s++) {
      const px = a.x + ((b.x - a.x) * s) / steps
      const py = a.y + ((b.y - a.y) * s) / steps
      c.save()
      c.translate(px, py)
      c.rotate(ang)
      c.beginPath()
      c.moveTo(-3, -4)
      c.lineTo(3, 0)
      c.lineTo(-3, 4)
      c.lineTo(-1, 0)
      c.closePath()
      c.fill()
      c.restore()
    }
  }

  // spawn-zone marker behind the entrance portal (soft circle)
  {
    const sp = activeWaypoints[0]
    const sg = c.createRadialGradient(sp.x, sp.y, 2, sp.x, sp.y, 30)
    sg.addColorStop(0, 'rgba(74,222,128,0.20)')
    sg.addColorStop(1, 'rgba(74,222,128,0)')
    c.fillStyle = sg
    c.fillRect(sp.x - 30, sp.y - 30, 60, 60)
  }

  // deterministic tire-track / crack marks along the road tiles
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!activePathSet.has(`${col},${r}`)) continue
      const hh = hash01(col * 41 + r * 113 + 555)
      if (hh < 0.62) continue
      const x = col * TILE
      const y = r * TILE
      c.fillStyle = darken(PALETTE.road, 16)
      if (hh > 0.84) {
        // crack: short forked line
        const sx = x + 8 + Math.floor(hash01(col * 7 + r) * (TILE - 16))
        const sy = y + 8 + Math.floor(hash01(col * 3 + r * 5) * (TILE - 16))
        c.fillRect(sx, sy, 6, 1)
        c.fillRect(sx + 5, sy - 3, 1, 5)
      } else {
        // twin tire tracks across the tile
        const ty = y + 12 + Math.floor(hash01(col + r * 9) * (TILE - 24))
        for (let tx = x + 3; tx < x + TILE - 3; tx += 5) {
          c.fillRect(tx, ty, 3, 1)
          c.fillRect(tx, ty + 7, 3, 1)
        }
      }
    }
  }

  // vignette
  const vg = c.createRadialGradient(
    WORLD_WIDTH / 2,
    WORLD_HEIGHT / 2,
    WORLD_HEIGHT * 0.35,
    WORLD_WIDTH / 2,
    WORLD_HEIGHT / 2,
    WORLD_HEIGHT * 0.75,
  )
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.45)')
  c.fillStyle = vg
  c.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

  // scanlines
  c.fillStyle = 'rgba(0,0,0,0.06)'
  for (let y = 0; y < WORLD_HEIGHT; y += 3) c.fillRect(0, y, WORLD_WIDTH, 1)
}

function drawRange(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  now: number,
  ok: boolean,
) {
  ctx.save()
  ctx.fillStyle = ok ? 'rgba(125,211,252,0.06)' : 'rgba(248,113,113,0.06)'
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.setLineDash([6, 5])
  ctx.lineDashOffset = -now / 30
  ctx.strokeStyle = ok ? 'rgba(125,211,252,0.7)' : 'rgba(248,113,113,0.7)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawPortal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  now: number,
) {
  const pulse = 0.5 + 0.5 * Math.sin(now / 320)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 0.25 + 0.2 * pulse
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, 16 + pulse * 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.globalAlpha = 1
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(x, y, 10 + pulse * 2, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 0.5
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawTower(ctx: CanvasRenderingContext2D, t: Tower, now: number) {
  const col = TOWER_COLORS[t.kind]
  const evolved = EVOLVED.has(t.kind)
  const plate = evolved ? 16 : 13

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(t.x, t.y + plate - 2, plate, plate * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()

  if (evolved) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.translate(t.x, t.y)
    ctx.rotate(now / 1200)
    ctx.strokeStyle = col
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.arc(0, 0, plate + 5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    ctx.globalAlpha = 1
  }

  ctx.fillStyle = '#0c1124'
  ctx.fillRect(t.x - plate - 1, t.y - plate - 1, (plate + 1) * 2, (plate + 1) * 2)
  ctx.fillStyle = darken(col, 50)
  ctx.fillRect(t.x - plate, t.y - plate, plate * 2, plate * 2)
  ctx.fillStyle = lighten(col, 30)
  ctx.fillRect(t.x - plate, t.y - plate, plate * 2, 2)
  ctx.fillRect(t.x - plate, t.y - plate, 2, plate * 2)
  ctx.fillStyle = darken(col, 30)
  ctx.fillRect(t.x - plate, t.y + plate - 2, plate * 2, 2)
  ctx.fillRect(t.x + plate - 2, t.y - plate, 2, plate * 2)

  if (evolved) {
    // octagonal base plate over the square one
    const o = plate
    const c = o * 0.42
    ctx.fillStyle = darken(col, 38)
    ctx.beginPath()
    ctx.moveTo(t.x - o + c, t.y - o)
    ctx.lineTo(t.x + o - c, t.y - o)
    ctx.lineTo(t.x + o, t.y - o + c)
    ctx.lineTo(t.x + o, t.y + o - c)
    ctx.lineTo(t.x + o - c, t.y + o)
    ctx.lineTo(t.x - o + c, t.y + o)
    ctx.lineTo(t.x - o, t.y + o - c)
    ctx.lineTo(t.x - o, t.y - o + c)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = lighten(col, 24)
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  const flash = t.flashMs > 0
  ctx.save()
  ctx.translate(t.x, t.y)
  ctx.rotate(t.aimAngle)
  ctx.fillStyle = flash ? '#ffffff' : col
  drawTurret(ctx, t.kind, plate)
  ctx.restore()

  const corePulse = 0.6 + 0.4 * Math.sin(now / 280 + t.id)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  if (evolved) {
    // brighter halo + white core for evolved towers
    ctx.globalAlpha = corePulse * 0.7
    ctx.fillStyle = lighten(col, 50)
    ctx.beginPath()
    ctx.arc(t.x, t.y, 8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = corePulse
  ctx.fillStyle = evolved ? '#ffffff' : lighten(col, 40)
  const cs = evolved ? 6 : 4
  ctx.fillRect(t.x - cs / 2, t.y - cs / 2, cs, cs)
  ctx.restore()
  ctx.globalAlpha = 1

  if (flash) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.translate(t.x, t.y)
    ctx.rotate(t.aimAngle)
    ctx.globalAlpha = 0.7
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(plate + 8, 0, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.globalAlpha = 1
  }

  ctx.fillStyle = PALETTE.gold
  for (let i = 0; i < t.level; i++) {
    const cx = t.x - 6 + i * 6
    const cy = t.y + plate + 4
    ctx.beginPath()
    ctx.moveTo(cx, cy + 3)
    ctx.lineTo(cx + 2.5, cy)
    ctx.lineTo(cx + 5, cy + 3)
    ctx.lineTo(cx + 2.5, cy + 1.5)
    ctx.closePath()
    ctx.fill()
  }
}

function drawTurret(ctx: CanvasRenderingContext2D, kind: TowerKind, plate: number) {
  switch (kind) {
    case 'pulse': {
      // twin round-capped barrels
      ctx.fillRect(0, -5, plate + 4, 3)
      ctx.fillRect(0, 2, plate + 4, 3)
      ctx.beginPath()
      ctx.arc(plate + 4, -3.5, 2, 0, Math.PI * 2)
      ctx.arc(plate + 4, 3.5, 2, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'splash': {
      // wide open mortar cup (U), no long barrel
      ctx.fillRect(0, -7, 5, 14)
      ctx.fillRect(0, 5, plate + 4, 4)
      ctx.fillRect(0, -9, plate + 4, 4)
      ctx.fillRect(plate, -9, 4, 18)
      break
    }
    case 'frost': {
      // faceted crystal/prism emitter
      ctx.beginPath()
      ctx.moveTo(2, -6)
      ctx.lineTo(plate + 2, -3)
      ctx.lineTo(plate + 8, 0)
      ctx.lineTo(plate + 2, 3)
      ctx.lineTo(2, 6)
      ctx.lineTo(plate - 2, 0)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'beam':
      // long thin lens barrel with glowing lens dot at tip
      ctx.fillRect(0, -1.5, plate + 12, 3)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(plate + 12, 0, 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      break
    case 'tempest':
      ctx.fillRect(0, -6, plate, 3)
      ctx.fillRect(0, 3, plate, 3)
      ctx.fillRect(0, -2, plate + 6, 4)
      break
    case 'railgun':
      ctx.fillRect(0, -3, plate + 14, 6)
      ctx.fillRect(plate + 12, -5, 4, 10)
      break
    case 'blizzard':
      ctx.beginPath()
      ctx.moveTo(2, -3)
      ctx.lineTo(plate + 4, -6)
      ctx.lineTo(plate + 8, 0)
      ctx.lineTo(plate + 4, 6)
      ctx.lineTo(2, 3)
      ctx.closePath()
      ctx.fill()
      break
    case 'prism':
      ctx.fillRect(0, -2, plate + 8, 4)
      ctx.beginPath()
      ctx.moveTo(plate + 6, -6)
      ctx.lineTo(plate + 14, 0)
      ctx.lineTo(plate + 6, 6)
      ctx.closePath()
      ctx.fill()
      break
  }
}

function enemyColor(en: Enemy): string {
  if (en.kind === 'fast') return PALETTE.enemyFast
  if (en.kind === 'tank') return PALETTE.enemyTank
  if (en.kind === 'boss') return PALETTE.enemyBoss
  return PALETTE.enemyNormal
}

/** 🟡 NORMAL — round slime blob with squash/stretch bob and forward eyes. */
function drawSlime(
  ctx: CanvasRenderingContext2D,
  en: Enemy,
  now: number,
  col: string,
) {
  const slowed = en.slowMs > 0
  const bobSpeed = slowed ? 360 : 180
  const t = Math.sin(now / bobSpeed + en.id)
  const bob = t * 1.5
  const rad = en.radius
  const rx = rad * (1 + t * 0.07)
  const ry = rad * (1 - t * 0.07)
  const cx = en.x
  const cy = en.y + bob
  const face = enemyFacing(en)
  const fx = Math.cos(face)

  // body
  ctx.fillStyle = darken(col, 36)
  ctx.beginPath()
  ctx.ellipse(cx, cy + 1, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  // rim light on top
  ctx.fillStyle = lighten(col, 40)
  ctx.beginPath()
  ctx.ellipse(cx - rx * 0.25, cy - ry * 0.45, rx * 0.5, ry * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()
  // forward-leaning eyes
  const ex = fx * rad * 0.3
  ctx.fillStyle = '#0b0f1f'
  ctx.fillRect(Math.round(cx + ex - 3), Math.round(cy - 2), 2, 3)
  ctx.fillRect(Math.round(cx + ex + 2), Math.round(cy - 2), 2, 3)
}

/** 🟠 FAST — small diamond drone with motion streak + jitter + glow core. */
function drawFast(
  ctx: CanvasRenderingContext2D,
  en: Enemy,
  now: number,
  col: string,
) {
  const rad = en.radius
  const jitter = Math.sin(now / 40 + en.id * 3) * 1.2
  const cx = en.x
  const cy = en.y + jitter
  const face = enemyFacing(en)

  // motion streak behind (opposite of facing)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = col
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx - Math.cos(face) * rad * 2.4, cy - Math.sin(face) * rad * 2.4)
  ctx.stroke()
  ctx.restore()
  ctx.globalAlpha = 1

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(face + Math.PI / 4)
  // diamond (rotated square) silhouette
  const s = rad
  ctx.fillStyle = '#0b0f1f'
  ctx.fillRect(-s - 1, -s - 1, (s + 1) * 2, (s + 1) * 2)
  ctx.fillStyle = col
  ctx.fillRect(-s, -s, s * 2, s * 2)
  ctx.fillStyle = lighten(col, 36)
  ctx.fillRect(-s, -s, s * 2, 2)
  ctx.fillRect(-s, -s, 2, s * 2)
  ctx.restore()

  // glowing core dot
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = '#fffbe6'
  const cs = 3 + Math.sin(now / 90 + en.id) * 1
  ctx.fillRect(Math.round(cx - cs / 2), Math.round(cy - cs / 2), cs, cs)
  ctx.restore()
}

/** 🟤 TANK — top-down hull + animated treads + rotating turret & barrel. */
function drawTank(ctx: CanvasRenderingContext2D, en: Enemy, now: number) {
  const rad = en.radius
  const cx = en.x
  const cy = en.y
  const face = enemyFacing(en)
  const body = PALETTE.enemyTankBody
  const tread = PALETTE.enemyTankTread

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(face)

  // local frame: +x = forward. hull longer than tall.
  const hl = rad * 1.15 // half length
  const hh = rad * 0.7 // half height
  const treadH = rad * 0.32

  // treads (perpendicular to travel — top & bottom bars)
  for (const sign of [-1, 1]) {
    const ty = sign * (hh + treadH * 0.2)
    ctx.fillStyle = tread
    ctx.fillRect(-hl, ty - treadH / 2, hl * 2, treadH)
    // rolling tick pattern scrolling with time
    ctx.fillStyle = lighten(tread, 28)
    const period = 5
    const scroll = (now / 22) % period
    for (let x = -hl - period + ((scroll + period) % period); x < hl; x += period) {
      ctx.fillRect(Math.round(x), Math.round(ty - treadH / 2), 2, treadH)
    }
  }

  // hull with bevel rim-light (top/left) + shadow (bottom/right)
  ctx.fillStyle = '#0b0f1f'
  ctx.fillRect(-hl - 1, -hh - 1, (hl + 1) * 2, (hh + 1) * 2)
  ctx.fillStyle = body
  ctx.fillRect(-hl, -hh, hl * 2, hh * 2)
  ctx.fillStyle = lighten(body, 30)
  ctx.fillRect(-hl, -hh, hl * 2, 2)
  ctx.fillRect(-hl, -hh, 2, hh * 2)
  ctx.fillStyle = darken(body, 34)
  ctx.fillRect(-hl, hh - 2, hl * 2, 2)
  ctx.fillRect(hl - 2, -hh, 2, hh * 2)

  // rounded turret box centered on hull
  const ts = rad * 0.5
  ctx.fillStyle = darken(body, 14)
  ctx.fillRect(-ts, -ts, ts * 2, ts * 2)
  ctx.fillStyle = lighten(body, 18)
  ctx.fillRect(-ts, -ts, ts * 2, 1.5)
  // gun barrel pointing forward (+x)
  ctx.fillStyle = darken(body, 40)
  ctx.fillRect(ts - 1, -2, rad * 0.9, 4)
  ctx.fillStyle = lighten(body, 10)
  ctx.fillRect(ts - 1, -2, rad * 0.9, 1)

  ctx.restore()

  // hit-flash hull (additive) handled by shared overlay in drawEnemy
}

/** 🔴 BOSS — armored core, shoulder pads, pulsing eye, cracks, spawn scale-in. */
function drawBoss(
  ctx: CanvasRenderingContext2D,
  en: Enemy,
  now: number,
  col: string,
) {
  const rad = en.radius
  // scale-in spawn animation over first ~400ms
  const scale = Math.min(1, 0.4 + (en.ageMs / 400) * 0.6)
  const cx = en.x
  const cy = en.y
  const face = enemyFacing(en)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.rotate(face)

  const r = rad

  // shoulder pads (trapezoids) on each side (perpendicular to travel)
  ctx.fillStyle = darken(col, 30)
  for (const sign of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(-r * 0.3, sign * r)
    ctx.lineTo(r * 0.3, sign * r)
    ctx.lineTo(r * 0.55, sign * (r + r * 0.5))
    ctx.lineTo(-r * 0.55, sign * (r + r * 0.5))
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = lighten(col, 18)
  for (const sign of [-1, 1]) {
    ctx.fillRect(-r * 0.5, sign * (r + r * 0.5) - (sign > 0 ? 2 : 0), r, 2)
  }

  // armored core box
  ctx.fillStyle = '#0b0f1f'
  ctx.fillRect(-r - 2, -r - 2, (r + 2) * 2, (r + 2) * 2)
  ctx.fillStyle = col
  ctx.fillRect(-r, -r, r * 2, r * 2)
  ctx.fillStyle = darken(col, 38)
  for (let i = -r; i < r; i += 8) ctx.fillRect(i, -r, 2, r * 2)
  ctx.fillStyle = lighten(col, 30)
  ctx.fillRect(-r, -r, r * 2, 2)
  ctx.fillStyle = darken(col, 30)
  ctx.fillRect(-r, r - 2, r * 2, 2)

  // damage cracks growing as hp drops (deterministic via hash)
  const ratio = Math.max(0, en.hp / en.maxHp)
  const thresholds = [0.75, 0.5, 0.25]
  ctx.strokeStyle = 'rgba(10,12,20,0.85)'
  ctx.lineWidth = 1.5
  for (let ci = 0; ci < thresholds.length; ci++) {
    if (ratio >= thresholds[ci]) continue
    const seed = en.id * 31 + ci * 97
    const ox = (hash01(seed) - 0.5) * r * 1.4
    const oy = (hash01(seed + 7) - 0.5) * r * 1.4
    const a1 = hash01(seed + 13) * Math.PI * 2
    const len = r * (0.5 + hash01(seed + 19) * 0.5)
    ctx.beginPath()
    ctx.moveTo(ox, oy)
    const mx = ox + Math.cos(a1) * len
    const my = oy + Math.sin(a1) * len
    ctx.lineTo(mx, my)
    // branch
    const a2 = a1 + (hash01(seed + 23) - 0.5) * 1.6
    ctx.lineTo(mx + Math.cos(a2) * len * 0.5, my + Math.sin(a2) * len * 0.5)
    ctx.stroke()
  }

  // pulsing additive core / eye
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const pulse = 0.5 + 0.5 * Math.sin(now / 180 + en.id)
  ctx.globalAlpha = 0.5 + 0.5 * pulse
  ctx.fillStyle = '#fff1f2'
  const es = r * 0.4 + pulse * 2
  ctx.beginPath()
  ctx.arc(0, 0, es, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.restore()
  ctx.globalAlpha = 1
}

/** Per-kind projectile rendering (called inside the additive-glow block). */
function drawProjectile(
  ctx: CanvasRenderingContext2D,
  pr: Projectile,
  now: number,
) {
  const col = TOWER_COLORS[pr.kind]
  const r = pr.radius
  const ang = Math.atan2(pr.y - pr.py, pr.x - pr.px)

  // trail
  ctx.strokeStyle = col
  ctx.globalAlpha = 0.45
  ctx.lineWidth = r
  ctx.beginPath()
  ctx.moveTo(pr.px, pr.py)
  ctx.lineTo(pr.x, pr.y)
  ctx.stroke()
  ctx.globalAlpha = 1

  if (pr.kind === 'frost' || pr.kind === 'blizzard') {
    // hexagonal cyan shard
    ctx.save()
    ctx.translate(pr.x, pr.y)
    ctx.rotate(now / 120)
    ctx.fillStyle = col
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const px = Math.cos(a) * (r + 1)
      const py = Math.sin(a) * (r + 1)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-1, -1, 2, 2)
    ctx.restore()
    return
  }

  if (pr.kind === 'splash') {
    // larger round shell
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(pr.x, pr.y, r + 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(pr.x, pr.y, r * 0.45, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  if (pr.kind === 'railgun') {
    // bright lance
    ctx.save()
    ctx.translate(pr.x, pr.y)
    ctx.rotate(ang)
    ctx.fillStyle = col
    ctx.fillRect(-r * 2, -r / 2, r * 4, r)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-r * 2, -1, r * 4, 2)
    ctx.restore()
    return
  }

  // pulse / tempest / generic round glowing dot
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(pr.x, pr.y, r * 0.5, 0, Math.PI * 2)
  ctx.fill()
}

/** Facing angle from the enemy toward its next waypoint (radians). */
function enemyFacing(en: Enemy): number {
  const t = activeWaypoints[en.wpIndex]
  if (!t) return 0
  const dx = t.x - en.x
  const dy = t.y - en.y
  if (dx === 0 && dy === 0) return 0
  return Math.atan2(dy, dx)
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  en: Enemy,
  now: number,
  bossLabel: string,
) {
  const slowed = en.slowMs > 0
  const col = enemyColor(en)
  const rad = en.radius

  // ground shadow (always)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(en.x, en.y + rad, rad, rad * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()

  if (en.kind === 'tank') drawTank(ctx, en, now)
  else if (en.kind === 'fast') drawFast(ctx, en, now, col)
  else if (en.kind === 'boss') drawBoss(ctx, en, now, col)
  else drawSlime(ctx, en, now, col)

  // shared slowed / hit overlays drawn over the body box footprint
  const cy = en.y
  if (slowed) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = 'rgba(125,211,252,0.32)'
    ctx.fillRect(en.x - rad, cy - rad, rad * 2, rad * 2)
    ctx.restore()
  }
  if (en.hitFlashMs > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, en.hitFlashMs / 90)})`
    ctx.fillRect(en.x - rad, cy - rad, rad * 2, rad * 2)
    ctx.restore()
  }

  if (en.hp < en.maxHp || en.kind === 'boss') {
    const ratio = Math.max(0, en.hp / en.maxHp)
    if (en.kind === 'boss') {
      const bw = rad * 2.4
      const bx = en.x - bw / 2
      const by = en.y - rad - 12
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(bx - 1, by - 1, bw + 2, 5)
      ctx.fillStyle = PALETTE.hp
      ctx.fillRect(bx, by, bw * ratio, 3)
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      for (let s = 1; s < 6; s++) ctx.fillRect(bx + (bw * s) / 6, by, 1, 3)
      ctx.textAlign = 'center'
      ctx.font = '8px "Courier New", monospace'
      ctx.fillStyle = '#fff1f2'
      ctx.fillText(bossLabel, en.x, by - 3)
      ctx.textAlign = 'left'
    } else {
      const bw = rad * 2
      ctx.fillStyle = PALETTE.hpBack
      ctx.fillRect(en.x - rad, en.y - rad - 6, bw, 3)
      ctx.fillStyle = PALETTE.hp
      ctx.fillRect(en.x - rad, en.y - rad - 6, bw * ratio, 3)
    }
  }
}

function drawWaveBanner(
  ctx: CanvasRenderingContext2D,
  banner: { wave: number; t: number },
  now: number,
  waveLabel: string,
  eventLabel: string | null,
) {
  const age = now - banner.t
  if (banner.wave <= 0 || age > 1600) return
  let x = WORLD_WIDTH / 2
  let alpha = 1
  if (age < 300) {
    const p = age / 300
    x = -200 + (WORLD_WIDTH / 2 + 200) * (1 - Math.pow(1 - p, 3))
    alpha = p
  } else if (age > 1300) {
    const p = (age - 1300) / 300
    x = WORLD_WIDTH / 2 + (WORLD_WIDTH / 2 + 200) * (p * p * p)
    alpha = 1 - p
  }
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.textAlign = 'center'
  ctx.font = 'bold 28px "Courier New", monospace'
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillText(`${waveLabel} ${banner.wave}`, x + 2, WORLD_HEIGHT / 2 + 2)
  ctx.fillStyle = '#fde047'
  ctx.fillText(`${waveLabel} ${banner.wave}`, x, WORLD_HEIGHT / 2)
  if (eventLabel) {
    ctx.font = 'bold 14px "Courier New", monospace'
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillText(eventLabel, x + 1, WORLD_HEIGHT / 2 + 23)
    ctx.fillStyle = '#fb7185'
    ctx.fillText(eventLabel, x, WORLD_HEIGHT / 2 + 22)
  }
  ctx.restore()
  ctx.globalAlpha = 1
  ctx.textAlign = 'left'
}
