'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

// ── Constants ──────────────────────────────────────────────────────────────────
const TILE = 40
const MAP_W = 48
const MAP_H = 36
const SPD = 3
const PW = 20
const PH = 28

// ── Buildings ─────────────────────────────────────────────────────────────────
interface Bld {
  id: string; label: string; emoji: string
  tx: number; ty: number; tw: number; th: number
  wall: string; roof: string
  lines: string[]
}

const BUILDINGS: Bld[] = [
  {
    id: 'about', label: 'House of About', emoji: '🏠',
    tx: 3, ty: 4, tw: 10, th: 8,
    wall: '#8b6914', roof: '#c0522d',
    lines: [
      '[ Seungil Oh ]',
      '',
      'Frontend Developer · 7+ years of experience',
      '',
      'Frontend is my main focus.',
      'I design and build state-driven UI and',
      'interactions with React, Next.js, Svelte, TypeScript.',
      '',
      'I also handle backend work.',
      'I can build servers/APIs with Go and Java,',
      "and I'm comfortable bridging frontend and backend.",
      '',
      "I'm confident in pixel-perfect markup too.",
      'I implement precise HTML/CSS markup',
      'and responsive layouts.',
    ],
  },
  {
    id: 'skills', label: 'Skill Tower', emoji: '🏰',
    tx: 32, ty: 3, tw: 9, th: 11,
    wall: '#3a3a7a', roof: '#5555aa',
    lines: [
      '[ Tech Stack ]',
      '',
      '── Frontend ──',
      '● HTML5 / CSS3      ★★★★★',
      '● JavaScript (ES6+) ★★★★★',
      '● React / Next.js   ★★★★☆',
      '● Svelte            ★★★★☆',
      '● TypeScript        ★★★☆☆',
      '● PixiJS            ★★★☆☆',
      '',
      '── Backend / DB ──',
      '● Go                ★★★☆☆',
      '● Java              ★★★☆☆',
      '● Node.js / Express ★★★☆☆',
      '● MySQL / MariaDB   ★★★☆☆',
      '● PHP               ★★☆☆☆',
      '',
      '── Tools / Design ──',
      '● Figma / Zeplin    ★★★★☆',
      '● Git / GitHub      ★★★★☆',
      '● AWS / Vercel      ★★★☆☆',
      '● Webpack / Vite    ★★★☆☆',
    ],
  },
  {
    id: 'projects', label: 'Project Shop', emoji: '🏪',
    tx: 30, ty: 20, tw: 12, th: 8,
    wall: '#2a6b3a', roof: '#1e4a28',
    lines: [
      '[ Featured Projects ]',
      '',
      '▸ BABA OPTION — Next.js brand site',
      '▸ CRM — Svelte + Web Components',
      '▸ babaoption WTS — PixiJS + Svelte',
      '▸ mytradinginfo — React crypto info app',
      '▸ mysoftwiz — EJS company site',
      '▸ kmuseum — Museum reservation site',
      '▸ Lala — React toddler AI app',
    ],
  },
  {
    id: 'career', label: 'Career Museum', emoji: '🏛️',
    tx: 3, ty: 22, tw: 13, th: 8,
    wall: '#555544', roof: '#333322',
    lines: [
      '[ Career ]',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '● Quantum AI',
      '  Dec 2025 ~ Present',
      '  Frontend Development',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '● Softwiz Co., Ltd.',
      '  May 2020 ~ Dec 2025 (5 yr 7 mo)',
      '  Web Team · Assistant Manager',
      '',
      '  Key work:',
      '  · Built brand sites with Next.js',
      '  · Built CRM with Svelte + Web Components',
      '  · Built trading UI with PixiJS',
      '  · Built internal admin system with MySQL',
      '  · Managed AWS server ops and deployment',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '● Smileday',
      '  Dec 2018 ~ Feb 2020 (1 yr 2 mo)',
      '  Web Dev Team · Staff',
      '',
      '  Key work:',
      '  · HTML/CSS/JS markup',
      '  · Built jQuery-based interactions',
      '  · Maintained PHP + MySQL web services',
      '  · Responsive web development',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '  Total experience: 7+ years',
    ],
  },
  {
    id: 'contact', label: 'Contact Post Office', emoji: '📮',
    tx: 18, ty: 26, tw: 9, th: 7,
    wall: '#8a3a2a', roof: '#aa4422',
    lines: [
      '[ Contact ]',
      '',
      '📧  c8c8c81828@gmail.com',
      '📱  050-6679-1577',
      '🐙  github.com/oikikomori',
      '🌐  kuuuma.com',
      '',
      'Feel free to reach out anytime!',
    ],
  },
  {
    id: 'games', label: 'Game Arcade', emoji: '🕹️',
    tx: 19, ty: 4, tw: 10, th: 8,
    wall: '#1a1a2e', roof: '#e94560',
    lines: [
      '[ Game Arcade ]',
      '',
      '▸ Tower Defense — strategy tower defense',
      '▸ Survive — top-down survival shooter',
      '▸ Typing Game — typing speed test',
      '▸ Tetris — classic Tetris',
      '',
      '← Exit and visit /games!',
    ],
  },
  {
    id: 'aetheria', label: 'AI Lab', emoji: '🧪',
    tx: 4, ty: 15, tw: 8, th: 5,
    wall: '#4a2d6b', roof: '#2d1b4a',
    lines: [
      '[ Project Aetheria ]',
      '',
      "In this town's plaza (the open lot to the right),",
      'two AI tribes — GPT and Gemini —',
      'are actually alive and moving around.',
      '',
      'They move, hunt, trade,',
      'and sometimes even die on their own.',
      'Their day advances every 8 hours.',
      '',
      'Go to the plaza and watch them yourself.',
    ],
  },
]

// Games reachable directly from the Game Arcade building
const ARCADE_GAMES: Array<{ label: string; emoji: string; href: string }> = [
  { label: 'Arcade', emoji: '🕹️', href: '/arcade' },
  { label: 'Tower Defense', emoji: '🏰', href: '/tower-defense' },
  { label: 'Survive', emoji: '⚔️', href: '/survive' },
  { label: 'Tetris', emoji: '🧱', href: '/tetris' },
  { label: 'Typing', emoji: '⌨️', href: '/typing-game' },
  { label: 'Lotto 6/45', emoji: '🎰', href: '/lotto' },
]

// AI 에이전트가 돌아다니는 마을 광장 (10x10 좌표계를 이 타일 범위에 매핑)
const PLAZA_TX = 13
const PLAZA_TY = 16
const PLAZA_TW = 8
const PLAZA_TH = 5
const AGENT_GRID = 10

interface NpcAgent {
  id: string
  model: 'gpt' | 'gemini'
  name: string
  role: string
  gold: number
  stamina: number
  x: number
  y: number
  status: string
  last_action: string | null
}

interface AetheriaEvent {
  agent_name: string
  model: 'gpt' | 'gemini'
  event_type: string
  display_text: string
}

// 에이전트 행동을 머리 위 말풍선용 짧은 라벨로 변환
const ACTION_BUBBLE: Record<string, string> = {
  hunt: '🍖 Hunt!',
  trade_offer: '💰 Trade',
  party_invite: '🤝 Ally',
  greeting: '👋 Hi',
  move: '🚶 Move',
  death: '💀',
  error: '…',
}
function actionBubble(action: string | null): string | null {
  if (!action) return null
  return ACTION_BUBBLE[action] ?? null
}

// ── Tile map (0=grass,1=path,2=tree,3=water) ──────────────────────────────────
function buildMap(): number[][] {
  const m: number[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(0))
  // paths
  for (let x = 0; x < MAP_W; x++) { m[14][x] = 1; m[15][x] = 1 }
  for (let y = 0; y < MAP_H; y++) { m[y][22] = 1; m[y][23] = 1 }
  // diagonal paths to buildings
  for (let i = 0; i < 8; i++) { m[4 + i][13] = 1; m[4 + i][14] = 1 }
  for (let i = 0; i < 8; i++) { m[4 + i][31] = 1; m[4 + i][32] = 1 }
  for (let i = 0; i < 8; i++) { m[20 + i][31] = 1; m[20 + i][32] = 1 }
  for (let i = 0; i < 8; i++) { m[22 + i][13] = 1; m[22 + i][14] = 1 }
  for (let i = 0; i < 7; i++) { m[26 + i][18] = 1; m[26 + i][19] = 1 }
  for (let i = 0; i < 7; i++) { m[4 + i][19] = 1; m[4 + i][20] = 1 }
  // trees border
  for (let x = 0; x < MAP_W; x++) { m[0][x] = 2; m[1][x] = 2; m[MAP_H - 1][x] = 2; m[MAP_H - 2][x] = 2 }
  for (let y = 0; y < MAP_H; y++) { m[y][0] = 2; m[y][1] = 2; m[y][MAP_W - 1] = 2; m[y][MAP_W - 2] = 2 }
  // scatter trees
  const treeSpots = [[5,17],[6,18],[8,16],[10,19],[15,6],[16,7],[15,19],[16,20],[25,7],[26,6],[25,19],[26,18],[38,7],[39,8],[38,18],[39,19]]
  treeSpots.forEach(([tx, ty]) => { if (m[ty]?.[tx] === 0) m[ty][tx] = 2 })
  // water pond
  for (let y = 8; y <= 11; y++) for (let x = 8; x <= 13; x++) m[y][x] = 3
  return m
}

// ── Drawing helpers ───────────────────────────────────────────────────────────
function drawTile(ctx: CanvasRenderingContext2D, t: number, sx: number, sy: number, seed: number) {
  if (t === 0) {
    ctx.fillStyle = (seed % 7 === 0) ? '#4f8a5f' : '#4a7c59'
    ctx.fillRect(sx, sy, TILE, TILE)
    if (seed % 11 === 0) {
      ctx.fillStyle = '#5a9a6a'
      ctx.fillRect(sx + 4, sy + 6, 5, 3)
      ctx.fillRect(sx + 12, sy + 14, 4, 3)
    }
  } else if (t === 1) {
    ctx.fillStyle = '#c4a882'
    ctx.fillRect(sx, sy, TILE, TILE)
    ctx.fillStyle = '#b89060'
    ctx.fillRect(sx + 1, sy + 1, 2, 2)
    ctx.fillRect(sx + TILE - 5, sy + TILE - 5, 3, 3)
  } else if (t === 2) {
    ctx.fillStyle = '#3d6b2a'
    ctx.fillRect(sx, sy, TILE, TILE)
    ctx.fillStyle = '#2d5a1b'
    ctx.beginPath()
    ctx.arc(sx + TILE / 2, sy + TILE / 2 + 2, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#3f7a25'
    ctx.beginPath()
    ctx.arc(sx + TILE / 2 - 4, sy + TILE / 2 - 2, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#4a2b0a'
    ctx.fillRect(sx + TILE / 2 - 2, sy + TILE / 2 + 10, 4, 8)
  } else if (t === 3) {
    const wave = Math.sin(Date.now() / 800 + sx * 0.1) * 1.5
    ctx.fillStyle = '#1e5a8a'
    ctx.fillRect(sx, sy, TILE, TILE)
    ctx.fillStyle = '#2870a8'
    ctx.fillRect(sx, sy + 8 + wave, TILE, 6)
    ctx.fillRect(sx, sy + 22 + wave, TILE, 5)
  }
}

function drawBuilding(ctx: CanvasRenderingContext2D, b: Bld, camX: number, camY: number, nearId: string | null) {
  const sx = b.tx * TILE - camX
  const sy = b.ty * TILE - camY
  const sw = b.tw * TILE
  const sh = b.th * TILE
  const isNear = nearId === b.id

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(sx + 6, sy + 10, sw, sh)

  // Wall
  ctx.fillStyle = b.wall
  ctx.fillRect(sx, sy + TILE, sw, sh - TILE)

  // Windows
  ctx.fillStyle = isNear ? '#ffe8a0' : '#c8d8a0'
  const winPositions = [[0.2, 0.4], [0.6, 0.4], [0.2, 0.65], [0.6, 0.65]]
  winPositions.forEach(([wx, wy]) => {
    ctx.fillRect(sx + sw * wx, sy + TILE + (sh - TILE) * wy, 14, 12)
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(sx + sw * wx + 6, sy + TILE + (sh - TILE) * wy, 2, 12)
    ctx.fillRect(sx + sw * wx, sy + TILE + (sh - TILE) * wy + 5, 14, 2)
    ctx.fillStyle = isNear ? '#ffe8a0' : '#c8d8a0'
  })

  // Roof
  ctx.fillStyle = b.roof
  ctx.beginPath()
  ctx.moveTo(sx - 6, sy + TILE + 2)
  ctx.lineTo(sx + sw / 2, sy - 4)
  ctx.lineTo(sx + sw + 6, sy + TILE + 2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.moveTo(sx + sw / 2, sy - 4)
  ctx.lineTo(sx + sw + 6, sy + TILE + 2)
  ctx.lineTo(sx + sw / 2 + 4, sy + TILE + 2)
  ctx.closePath()
  ctx.fill()

  // Door
  ctx.fillStyle = '#2a1a0a'
  const dx = sx + sw / 2 - 14
  const dy = sy + sh - 34
  ctx.fillRect(dx, dy, 28, 34)
  ctx.fillStyle = '#6b4010'
  ctx.fillRect(dx + 2, dy + 2, 24, 30)
  ctx.fillStyle = '#c8a020'
  ctx.beginPath()
  ctx.arc(dx + 20, dy + 17, 3, 0, Math.PI * 2)
  ctx.fill()

  // Sign
  ctx.fillStyle = '#f5e8c0'
  ctx.fillRect(sx + sw / 2 - 45, sy + sh - 72, 90, 22)
  ctx.strokeStyle = '#8b6914'
  ctx.lineWidth = 1.5
  ctx.strokeRect(sx + sw / 2 - 45, sy + sh - 72, 90, 22)
  ctx.fillStyle = '#3a2010'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`${b.emoji} ${b.label}`, sx + sw / 2, sy + sh - 55)

  // Glow if near
  if (isNear) {
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 3
    ctx.strokeRect(sx, sy + TILE, sw, sh - TILE)
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 14
    ctx.strokeRect(sx, sy + TILE, sw, sh - TILE)
    ctx.shadowBlur = 0

    // E prompt
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(sx + sw / 2 - 48, sy - 26, 96, 22)
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('[E] Enter', sx + sw / 2, sy - 10)
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, px: number, py: number, dir: number, frame: number) {
  const x = px - PW / 2
  const y = py - PH

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(px, py + 2, 10, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = '#3a7abf'
  ctx.fillRect(x + 3, y + 12, PW - 6, PH - 14)

  // Head
  ctx.fillStyle = '#f0c878'
  ctx.fillRect(x + 4, y, PW - 8, 14)

  // Hair
  ctx.fillStyle = '#2a1a0a'
  ctx.fillRect(x + 4, y, PW - 8, 4)
  ctx.fillRect(x + 4, y + 4, 3, 3)
  ctx.fillRect(x + PW - 9, y + 4, 3, 3)

  // Eyes
  ctx.fillStyle = '#1a0a00'
  if (dir === 0) { // down
    ctx.fillRect(x + 6, y + 7, 3, 3)
    ctx.fillRect(x + PW - 11, y + 7, 3, 3)
  } else if (dir === 1) { // up
    ctx.fillRect(x + 5, y + 8, 3, 2)
    ctx.fillRect(x + PW - 10, y + 8, 3, 2)
  } else { // left/right
    ctx.fillRect(dir === 2 ? x + 5 : x + PW - 10, y + 7, 3, 3)
  }

  // Legs
  const legOff = Math.sin(frame * 0.3) * 3
  ctx.fillStyle = '#1a1a3a'
  ctx.fillRect(x + 4, y + PH - 10, 6, 10 + (dir === 0 ? legOff : 0))
  ctx.fillRect(x + PW - 12, y + PH - 10, 6, 10 - (dir === 0 ? legOff : 0))

  // Shoes
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(x + 3, y + PH - 2, 8, 4)
  ctx.fillRect(x + PW - 13, y + PH - 2, 8, 4)
}

// Project Aetheria 에이전트 NPC — 플레이어보다 살짝 작고, 모델별 색상 + 이름표
function drawNpc(ctx: CanvasRenderingContext2D, npc: NpcAgent, px: number, py: number, bob: number) {
  const w = PW * 0.85
  const h = PH * 0.85
  const x = px - w / 2
  const y = py - h + bob
  const bodyColor = npc.model === 'gpt' ? '#3ab0a0' : '#bf5a3a'
  const dead = npc.status !== 'alive'

  ctx.globalAlpha = dead ? 0.35 : 1

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(px, py + 2, 9, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = bodyColor
  ctx.fillRect(x + 3, y + 10, w - 6, h - 12)

  // Head
  ctx.fillStyle = '#f0c878'
  ctx.fillRect(x + 3, y, w - 6, 12)

  // Hair
  ctx.fillStyle = '#2a1a0a'
  ctx.fillRect(x + 3, y, w - 6, 3)

  // Nameplate
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  const label = `${dead ? '💀' : ''}${npc.name}`
  ctx.font = 'bold 10px monospace'
  const tw = ctx.measureText(label).width
  ctx.fillRect(px - tw / 2 - 4, y - 16, tw + 8, 13)
  ctx.fillStyle = npc.model === 'gpt' ? '#8be0d4' : '#f0a888'
  ctx.textAlign = 'center'
  ctx.fillText(label, px, y - 6)

  // Speech bubble — 살아있는 에이전트의 현재 행동 (이름표 위)
  const bubble = dead ? null : actionBubble(npc.last_action)
  if (bubble) {
    ctx.font = 'bold 10px sans-serif'
    const bw = ctx.measureText(bubble).width + 12
    const by = y - 34
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.beginPath()
    // 둥근 말풍선
    const bx = px - bw / 2
    const r = 5
    ctx.moveTo(bx + r, by)
    ctx.arcTo(bx + bw, by, bx + bw, by + 16, r)
    ctx.arcTo(bx + bw, by + 16, bx, by + 16, r)
    ctx.arcTo(bx, by + 16, bx, by, r)
    ctx.arcTo(bx, by, bx + bw, by, r)
    ctx.closePath()
    ctx.fill()
    // 꼬리
    ctx.beginPath()
    ctx.moveTo(px - 3, by + 16)
    ctx.lineTo(px + 3, by + 16)
    ctx.lineTo(px, by + 21)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#1a1a1a'
    ctx.fillText(bubble, px, by + 12)
  }

  ctx.globalAlpha = 1
}

// AI 연구소 건물 안에서 보는 실시간 현황판 (RPG 안에서 모든 걸 확인)
interface HallEntry {
  name: string
  model: 'gpt' | 'gemini'
  role: string
  season: number
  survived_days: number
  final_gold: number
}

function AetheriaPanel({ data }: { data: { agents: NpcAgent[]; events: AetheriaEvent[]; tick: number; season: number; hallOfFame: { longest: HallEntry[]; richest: HallEntry[] } } }) {
  const { agents, events, tick, season, hallOfFame } = data
  const alive = agents.filter((a) => a.status === 'alive').length
  const sorted = [...agents].sort((a, b) => b.gold - a.gold)

  if (agents.length === 0) {
    return (
      <p className="font-mono text-sm text-green-100/60">
        No simulation data yet. Agents advance a day every 8 hours.
      </p>
    )
  }

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto font-mono text-sm">
      <p className="text-green-300">
        🗓️ Season {season} · 🕐 Day {tick} · 💚 Alive {alive}/{agents.length}
      </p>

      <Link
        href="/aetheria/history"
        className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300 transition hover:bg-amber-500/20"
      >
        🏛️ Chronicle · View Hall of Fame →
      </Link>

      {/* Agent status */}
      <div className="space-y-1">
        {sorted.map((a) => {
          const dead = a.status !== 'alive'
          const color = a.model === 'gpt' ? '#8be0d4' : '#f0a888'
          return (
            <div key={a.id} className={`flex items-center gap-2 text-xs ${dead ? 'opacity-40' : ''}`}>
              <span style={{ color }} className="w-14 font-bold">{dead ? '💀' : ''}{a.name}</span>
              <span className="text-green-700">{a.model.toUpperCase()}</span>
              <span className="text-amber-300">🪙{a.gold}</span>
              {!dead && <span className="text-green-200">❤️{a.stamina}</span>}
              <span className="ml-auto text-green-100/50">{ACTION_BUBBLE[a.last_action ?? ''] ?? a.last_action ?? '-'}</span>
            </div>
          )
        })}
      </div>

      {/* Recent event log */}
      {events.length > 0 && (
        <div className="border-t border-[#4a8a5a]/30 pt-2">
          <p className="mb-1 text-[10px] text-green-700">Recent Activity</p>
          <div className="space-y-0.5">
            {events.slice(0, 8).map((e, i) => (
              <p key={i} className="text-[11px] text-green-100/60">
                <span className="text-green-300">{e.agent_name}</span> {e.display_text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Hall of Fame */}
      {(hallOfFame.longest.length > 0 || hallOfFame.richest.length > 0) && (
        <div className="border-t border-[#4a8a5a]/30 pt-2">
          <p className="mb-1 text-[10px] text-amber-500">🏛️ Hall of Fame</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-0.5 text-[10px] text-green-700">🕐 Longest Survivor</p>
              {hallOfFame.longest.map((h, i) => (
                <p key={i} className="text-[11px] text-green-100/60">
                  {i + 1}. {h.name} — {h.survived_days}d <span className="text-green-800">(S{h.season})</span>
                </p>
              ))}
            </div>
            <div>
              <p className="mb-0.5 text-[10px] text-green-700">🪙 Richest</p>
              {hallOfFame.richest.map((h, i) => (
                <p key={i} className="text-[11px] text-green-100/60">
                  {i + 1}. {h.name} — {h.final_gold} <span className="text-green-800">(S{h.season})</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RPGPageClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    px: 23 * TILE, py: 15 * TILE,
    keys: new Set<string>(),
    dir: 0, frame: 0, nearId: null as string | null,
    map: buildMap(),
    animId: 0,
    npcAgents: [] as NpcAgent[],
    camX: 0,
    camY: 0,
    dayPhase: 0,
  })
  const [dialog, setDialog] = useState<{ bld: Bld } | null>(null)
  const [selectedNpc, setSelectedNpc] = useState<NpcAgent | null>(null)
  const [started, setStarted] = useState(false)
  // AI 연구소 실시간 현황판용 (React state로 관리해 다이얼로그에서 렌더)
  const [aetheriaData, setAetheriaData] = useState<{ agents: NpcAgent[]; events: AetheriaEvent[]; tick: number; season: number; hallOfFame: { longest: HallEntry[]; richest: HallEntry[] } }>({
    agents: [],
    events: [],
    tick: 0,
    season: 1,
    hallOfFame: { longest: [], richest: [] },
  })
  const dialogRef = useRef(dialog)
  dialogRef.current = dialog

  const getBuildingAtPlayer = useCallback((px: number, py: number): string | null => {
    const tx = Math.floor(px / TILE)
    const ty = Math.floor(py / TILE)
    for (const b of BUILDINGS) {
      const margin = 2
      if (tx >= b.tx - margin && tx < b.tx + b.tw + margin &&
          ty >= b.ty - margin && ty < b.ty + b.th + margin) {
        return b.id
      }
    }
    return null
  }, [])

  // Touch controls — feed synthetic keys into the game loop's key set
  const pressDir = useCallback((key: string) => {
    stateRef.current.keys.add(key)
  }, [])
  const releaseDir = useCallback((key: string) => {
    stateRef.current.keys.delete(key)
  }, [])
  const touchAction = useCallback(() => {
    const s = stateRef.current
    if (dialogRef.current) {
      setDialog(null)
    } else if (s.nearId) {
      const bld = BUILDINGS.find((b) => b.id === s.nearId)
      if (bld) setDialog({ bld })
    }
  }, [])

  // Project Aetheria 에이전트를 마을 광장 NPC로 불러온다 (읽기 전용, LLM 호출 없음).
  useEffect(() => {
    if (!started) return
    let cancelled = false
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/aetheria/public', { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const data = await res.json()
        stateRef.current.npcAgents = data.agents ?? []
        setAetheriaData({
          agents: data.agents ?? [],
          events: data.recentEvents ?? [],
          tick: data.currentTick ?? 0,
          season: data.season ?? 1,
          hallOfFame: data.hallOfFame ?? { longest: [], richest: [] },
        })
      } catch {
        // 네트워크 오류는 무시 — 다음 폴링에서 재시도
      }
    }
    fetchAgents()
    const interval = setInterval(fetchAgents, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [started])

  useEffect(() => {
    if (!started) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const s = stateRef.current

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)) {
        e.preventDefault()
        s.keys.add(e.key)
      }
      if (e.key === 'e' || e.key === 'E') {
        if (s.nearId && !dialogRef.current) {
          const bld = BUILDINGS.find(b => b.id === s.nearId)
          if (bld) setDialog({ bld })
        } else if (dialogRef.current) {
          setDialog(null)
        }
      }
      if (e.key === 'Escape') setDialog(null)
    }
    const onKeyUp = (e: KeyboardEvent) => s.keys.delete(e.key)
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)

    const isSolid = (wx: number, wy: number) => {
      for (const b of BUILDINGS) {
        if (wx >= b.tx * TILE && wx < (b.tx + b.tw) * TILE &&
            wy >= b.ty * TILE && wy < (b.ty + b.th) * TILE) return true
      }
      const tx = Math.floor(wx / TILE)
      const ty = Math.floor(wy / TILE)
      return s.map[ty]?.[tx] === 2
    }

    let lastTs = performance.now()
    const loop = () => {
      const now = performance.now()
      const dt = Math.min(100, now - lastTs)
      lastTs = now
      if (!dialogRef.current) {
        const k = s.keys
        let dx = 0, dy = 0
        if (k.has('ArrowLeft') || k.has('a') || k.has('A')) { dx = -SPD; s.dir = 2 }
        if (k.has('ArrowRight') || k.has('d') || k.has('D')) { dx = SPD; s.dir = 3 }
        if (k.has('ArrowUp') || k.has('w') || k.has('W')) { dy = -SPD; s.dir = 1 }
        if (k.has('ArrowDown') || k.has('s') || k.has('S')) { dy = SPD; s.dir = 0 }
        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707 }
        if (dx !== 0 || dy !== 0) s.frame++

        const nx = Math.max(TILE * 2, Math.min(s.px + dx, TILE * (MAP_W - 2)))
        const ny = Math.max(TILE * 2, Math.min(s.py + dy, TILE * (MAP_H - 2)))
        if (!isSolid(nx - PW / 2 + 2, ny) && !isSolid(nx + PW / 2 - 2, ny)) s.px = nx
        if (!isSolid(s.px - PW / 2 + 2, ny) && !isSolid(s.px + PW / 2 - 2, ny)) s.py = ny
        s.nearId = getBuildingAtPlayer(s.px, s.py)
      }

      const W = canvas.width, H = canvas.height
      let camX = s.px - W / 2
      let camY = s.py - H / 2
      camX = Math.max(0, Math.min(camX, MAP_W * TILE - W))
      camY = Math.max(0, Math.min(camY, MAP_H * TILE - H))
      s.camX = camX
      s.camY = camY

      // Draw map
      const t0x = Math.max(0, Math.floor(camX / TILE))
      const t0y = Math.max(0, Math.floor(camY / TILE))
      const t1x = Math.min(MAP_W, Math.ceil((camX + W) / TILE) + 1)
      const t1y = Math.min(MAP_H, Math.ceil((camY + H) / TILE) + 1)
      for (let ty = t0y; ty < t1y; ty++) {
        for (let tx = t0x; tx < t1x; tx++) {
          drawTile(ctx, s.map[ty][tx], tx * TILE - camX, ty * TILE - camY, ty * 100 + tx)
        }
      }

      // Draw buildings (sorted by y for depth)
      const sorted = [...BUILDINGS].sort((a, b) => a.ty - b.ty)
      sorted.forEach(b => drawBuilding(ctx, b, camX, camY, s.nearId))

      // Draw Aetheria NPC agents (마을 광장을 돌아다니는 실제 AI 에이전트)
      const bob = Math.sin(s.frame * 0.08) * 2
      for (const npc of s.npcAgents) {
        const worldX = (PLAZA_TX + (npc.x / (AGENT_GRID - 1)) * PLAZA_TW) * TILE
        const worldY = (PLAZA_TY + (npc.y / (AGENT_GRID - 1)) * PLAZA_TH) * TILE
        drawNpc(ctx, npc, worldX - camX, worldY - camY, bob)
      }

      // Draw player
      drawPlayer(ctx, s.px - camX, s.py - camY, s.dir, s.frame)

      // ── 낮/밤 사이클 오버레이 ──────────────────────────────────
      // 약 90초에 하루가 한 바퀴 (낮→노을→밤→새벽). 맵·캐릭터 위, HUD 아래에 색조를 씌운다.
      s.dayPhase = (s.dayPhase + dt / 90000) % 1
      const phase = s.dayPhase
      // 밤일수록 어둡고 푸른 톤, 노을엔 주황 톤
      let overlay: string | null = null
      if (phase < 0.25) {
        // 아침 → 한낮: 오버레이 없음
        overlay = null
      } else if (phase < 0.4) {
        // 해질녘 (주황)
        const k = (phase - 0.25) / 0.15
        overlay = `rgba(255,140,60,${0.22 * k})`
      } else if (phase < 0.55) {
        // 노을 → 밤 진입
        const k = (phase - 0.4) / 0.15
        overlay = `rgba(30,20,70,${0.15 + 0.4 * k})`
      } else if (phase < 0.8) {
        // 깊은 밤 (짙은 남색)
        overlay = 'rgba(20,20,60,0.55)'
      } else {
        // 새벽 → 아침 (점점 밝아짐)
        const k = (phase - 0.8) / 0.2
        overlay = `rgba(20,20,60,${0.55 * (1 - k)})`
      }
      if (overlay) {
        ctx.fillStyle = overlay
        ctx.fillRect(0, 0, W, H)
      }

      // Time-of-day label
      const timeLabel = phase < 0.25 ? '☀️ Day' : phase < 0.4 ? '🌇 Sunset' : phase < 0.8 ? '🌙 Night' : '🌅 Dawn'
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.fillRect(10, 10, 74, 24)
      ctx.fillStyle = '#f0f0f0'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(timeLabel, 18, 27)

      // Minimap
      const mm = 120, ms = mm / MAP_W
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(W - mm - 12, 12, mm + 4, Math.round(MAP_H * ms) + 4)
      for (let ty = 0; ty < MAP_H; ty++) {
        for (let tx = 0; tx < MAP_W; tx++) {
          const t = s.map[ty][tx]
          ctx.fillStyle = t === 1 ? '#c4a882' : t === 2 ? '#2d5a1b' : t === 3 ? '#2c5f8a' : '#4a7c59'
          ctx.fillRect(W - mm - 10 + tx * ms, 14 + ty * ms, ms, ms)
        }
      }
      BUILDINGS.forEach(b => {
        ctx.fillStyle = b.wall
        ctx.fillRect(W - mm - 10 + b.tx * ms, 14 + b.ty * ms, b.tw * ms, b.th * ms)
      })

      // AI 에이전트 위치 (모델별 색상 점) — 광장 좌표를 미니맵에 매핑
      for (const npc of s.npcAgents) {
        if (npc.status !== 'alive') continue
        const worldTx = PLAZA_TX + (npc.x / (AGENT_GRID - 1)) * PLAZA_TW
        const worldTy = PLAZA_TY + (npc.y / (AGENT_GRID - 1)) * PLAZA_TH
        ctx.fillStyle = npc.model === 'gpt' ? '#3ab0a0' : '#bf5a3a'
        ctx.fillRect(W - mm - 10 + worldTx * ms - 1, 14 + worldTy * ms - 1, 3, 3)
      }

      // 플레이어 위치 (노란 점)
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(W - mm - 10 + (s.px / TILE) * ms - 2, 14 + (s.py / TILE) * ms - 2, 4, 4)

      // Controls hint
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(10, H - 36, 220, 26)
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '11px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('WASD / Arrows: Move  |  E: Enter/Close', 18, H - 18)

      s.animId = requestAnimationFrame(loop)
    }
    s.animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(s.animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [started, getBuildingAtPlayer])

  // ── Start screen ─────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="w-full h-screen bg-[#1a2e1a] flex flex-col items-center justify-center gap-8 select-none">
        <div className="text-center">
          <p className="text-green-500 font-mono text-xs tracking-[0.3em] uppercase mb-3">Portfolio RPG</p>
          <h1 className="text-5xl font-black text-white mb-2" style={{ textShadow: '0 0 30px #4a7' }}>
            🗺️ kuuuma World
          </h1>
          <p className="text-green-300/60 font-mono text-sm">Explore the portfolio through the town</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono text-green-300/70 border border-green-800 px-8 py-5 rounded-xl bg-black/30">
          <div>🏠 House of About</div>
          <div>🏰 Skill Tower</div>
          <div>🏪 Project Shop</div>
          <div>🏛️ Career Museum</div>
          <div>📮 Contact Post Office</div>
          <div>🕹️ Game Arcade</div>
        </div>

        <div className="text-center text-xs font-mono text-green-400/50 space-y-1">
          <p>WASD / Arrow Keys — Move</p>
          <p>E — Enter building / Close</p>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-black text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{ boxShadow: '0 0 30px #2d6a2d' }}
        >
          ▶ Start Game
        </button>

        <Link href="/" className="text-green-600 hover:text-green-400 text-xs font-mono transition-colors">
          ← Back to Home
        </Link>
      </div>
    )
  }

  // ── Game ─────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-screen overflow-hidden bg-[#1a2e1a] relative" style={{ imageRendering: 'pixelated' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ imageRendering: 'pixelated' }}
        onClick={(e) => {
          const s = stateRef.current
          const rect = e.currentTarget.getBoundingClientRect()
          // 캔버스 내부 좌표 → 월드 좌표
          const scaleX = e.currentTarget.width / rect.width
          const scaleY = e.currentTarget.height / rect.height
          const wx = (e.clientX - rect.left) * scaleX + s.camX
          const wy = (e.clientY - rect.top) * scaleY + s.camY
          // 가장 가까운 에이전트 히트 테스트 (반경 24px)
          let hit: NpcAgent | null = null
          let best = 24
          for (const npc of s.npcAgents) {
            const ax = (PLAZA_TX + (npc.x / (AGENT_GRID - 1)) * PLAZA_TW) * TILE
            const ay = (PLAZA_TY + (npc.y / (AGENT_GRID - 1)) * PLAZA_TH) * TILE
            const d = Math.hypot(ax - wx, ay - wy)
            if (d < best) { best = d; hit = npc }
          }
          if (hit) setSelectedNpc(hit)
        }}
      />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 text-[11px] font-mono text-white/40 hover:text-white/80 bg-black/40 px-3 py-1.5 rounded transition-colors"
      >
        ← Exit
      </Link>

      {/* Dialog box */}
      {dialog && (
        <div className="absolute inset-0 z-30 flex items-end justify-center pb-12 px-4 sm:px-8 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto">
            <div className="bg-[#0a0a1a] border-2 border-[#4a8a5a] rounded-xl p-5 sm:p-6 shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(74,138,90,0.4)' }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#4a8a5a]/40">
                <span className="text-2xl">{dialog.bld.emoji}</span>
                <h3 className="text-green-400 font-black font-mono text-sm tracking-wider">
                  {dialog.bld.label}
                </h3>
                <button
                  onClick={() => setDialog(null)}
                  className="ml-auto text-[11px] font-mono text-green-600 hover:text-green-300"
                  aria-label="Close"
                >
                  ✕ Close
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
              {dialog.bld.id === 'aetheria' ? (
                <AetheriaPanel data={aetheriaData} />
              ) : dialog.bld.id === 'games' ? (
                <div>
                  <p className="mb-3 font-mono text-sm font-bold text-green-300">[ Game Arcade ]</p>
                  <p className="mb-4 font-mono text-xs text-green-100/60">Choose a game to play.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ARCADE_GAMES.map((g) => (
                      <Link
                        key={g.href}
                        href={g.href}
                        className="flex items-center gap-2 rounded-lg border border-[#4a8a5a]/40 bg-[#0f1a0f] px-3 py-2.5 font-mono text-sm text-green-200 transition-colors hover:border-green-400 hover:bg-[#12251a]"
                      >
                        <span className="text-lg">{g.emoji}</span>
                        {g.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
              <div className="space-y-1.5">
                {dialog.bld.lines.map((line, i) => (
                  <p key={i} className={`font-mono text-sm ${
                    line.startsWith('[') ? 'text-green-300 font-bold' :
                    line.startsWith('●') || line.startsWith('▸') ? 'text-green-200' :
                    line === '' ? 'h-2' :
                    'text-green-100/70'
                  }`}>
                    {line || ' '}
                  </p>
                ))}
              </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 에이전트 클릭 시 상세 카드 */}
      {selectedNpc && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 px-6"
          onClick={() => setSelectedNpc(null)}
        >
          <div
            className="w-full max-w-xs rounded-xl border-2 p-5 shadow-2xl"
            style={{
              background: '#0a0a1a',
              borderColor: selectedNpc.model === 'gpt' ? '#3ab0a0' : '#bf5a3a',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedNpc.model === 'gpt' ? '#3ab0a0' : '#bf5a3a' }}
              />
              <span className="font-mono text-base font-black text-white">
                {selectedNpc.status !== 'alive' ? '💀 ' : ''}{selectedNpc.name}
              </span>
              <span className="ml-auto text-[10px] font-mono text-slate-500">Close ✕</span>
            </div>
            <div className="space-y-1.5 font-mono text-sm text-slate-300">
              <p>Model: <span className="text-white">{selectedNpc.model === 'gpt' ? 'GPT-4o mini' : 'Gemini 2.5 Flash'}</span></p>
              <p>Role: <span className="text-white">{selectedNpc.role}</span></p>
              <p>Gold: <span className="text-amber-300">🪙 {selectedNpc.gold}</span></p>
              <p>HP: <span className="text-emerald-300">❤️ {selectedNpc.stamina}</span></p>
              <p>Status: <span className="text-white">{selectedNpc.status === 'alive' ? 'Alive' : 'Dead'}</span></p>
              {selectedNpc.last_action && (
                <p>Last action: <span className="text-white">{ACTION_BUBBLE[selectedNpc.last_action] ?? selectedNpc.last_action}</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile touch controls (hidden on md+) */}
      {!dialog && (
        <div className="md:hidden">
          {/* D-pad */}
          <div className="absolute bottom-8 left-6 z-20 select-none touch-none">
            <div className="relative w-36 h-36">
              {([
                { key: 'ArrowUp', cls: 'top-0 left-1/2 -translate-x-1/2', label: '▲' },
                { key: 'ArrowDown', cls: 'bottom-0 left-1/2 -translate-x-1/2', label: '▼' },
                { key: 'ArrowLeft', cls: 'left-0 top-1/2 -translate-y-1/2', label: '◀' },
                { key: 'ArrowRight', cls: 'right-0 top-1/2 -translate-y-1/2', label: '▶' },
              ] as const).map((d) => (
                <button
                  key={d.key}
                  onPointerDown={(e) => { e.preventDefault(); pressDir(d.key) }}
                  onPointerUp={(e) => { e.preventDefault(); releaseDir(d.key) }}
                  onPointerLeave={() => releaseDir(d.key)}
                  onPointerCancel={() => releaseDir(d.key)}
                  className={`absolute ${d.cls} w-12 h-12 flex items-center justify-center rounded-xl bg-black/45 border border-green-700/60 text-green-300 text-lg active:bg-green-700/60 backdrop-blur-sm`}
                  aria-label={d.key}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            onPointerDown={(e) => { e.preventDefault(); touchAction() }}
            className="absolute bottom-12 right-8 z-20 w-20 h-20 rounded-full bg-green-600/80 border-2 border-green-300/60 text-white font-black text-xl active:bg-green-500 backdrop-blur-sm select-none touch-none"
            aria-label="Enter / Close"
          >
            E
          </button>
        </div>
      )}
    </div>
  )
}
