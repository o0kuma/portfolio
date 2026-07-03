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
    id: 'about', label: '소개의 집', emoji: '🏠',
    tx: 3, ty: 4, tw: 10, th: 8,
    wall: '#8b6914', roof: '#c0522d',
    lines: [
      '[ 오승일 / Seungil Oh ]',
      '',
      '프론트엔드 개발자 · 개발경력 7년+',
      '',
      '주력은 프론트엔드입니다.',
      'React · Next.js · Svelte · TypeScript로',
      '상태 기반 UI와 인터랙션을 설계·구현합니다.',
      '',
      '백엔드도 다룹니다.',
      'Go · Java로 서버·API 개발이 가능하며,',
      '프론트-백엔드를 아우르는 작업에 익숙합니다.',
      '',
      '퍼블리싱도 자신 있습니다.',
      'HTML/CSS로 픽셀 단위 마크업과',
      '반응형 화면을 정확하게 구현합니다.',
    ],
  },
  {
    id: 'skills', label: '스킬 타워', emoji: '🏰',
    tx: 32, ty: 3, tw: 9, th: 11,
    wall: '#3a3a7a', roof: '#5555aa',
    lines: [
      '[ 기술 스택 ]',
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
    id: 'projects', label: '프로젝트 상점', emoji: '🏪',
    tx: 30, ty: 20, tw: 12, th: 8,
    wall: '#2a6b3a', roof: '#1e4a28',
    lines: [
      '[ 주요 프로젝트 ]',
      '',
      '▸ BABA OPTION — Next.js 브랜드 사이트',
      '▸ CRM — Svelte + Web Components',
      '▸ babaoption WTS — PixiJS + Svelte',
      '▸ mytradinginfo — React 코인 정보',
      '▸ mysoftwiz — EJS 회사 소개',
      '▸ kmuseum — 박물관 예약 사이트',
      '▸ 랄라 — React 유아 AI 앱',
    ],
  },
  {
    id: 'career', label: '경력 박물관', emoji: '🏛️',
    tx: 3, ty: 22, tw: 13, th: 8,
    wall: '#555544', roof: '#333322',
    lines: [
      '[ 경력 ]',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '● 퀀텀에이아이 (Quantum AI)',
      '  2025.12.15 ~ 현재',
      '  프론트엔드 개발',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '● (주)소프트위즈',
      '  2020.05 ~ 2025.12.05 (5년 7개월)',
      '  웹팀 · 대리',
      '',
      '  주요 업무:',
      '  · Next.js 기반 브랜드 사이트 구축',
      '  · Svelte + Web Components CRM 개발',
      '  · PixiJS 기반 트레이딩 UI 개발',
      '  · MySQL 연동 사내 관리 시스템 개발',
      '  · AWS 서버 운영 및 배포 관리',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '● 스마일데이',
      '  2018.12 ~ 2020.02 (1년 2개월)',
      '  웹개발팀 · 사원',
      '',
      '  주요 업무:',
      '  · HTML/CSS/JS 퍼블리싱',
      '  · jQuery 기반 인터렉션 구현',
      '  · PHP + MySQL 웹 서비스 유지보수',
      '  · 반응형 웹 개발',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '  총 경력: 약 7년+',
    ],
  },
  {
    id: 'contact', label: '연락처 우체국', emoji: '📮',
    tx: 18, ty: 26, tw: 9, th: 7,
    wall: '#8a3a2a', roof: '#aa4422',
    lines: [
      '[ 연락처 ]',
      '',
      '📧  c8c8c81828@gmail.com',
      '📱  050-6679-1577',
      '🐙  github.com/oikikomori',
      '🌐  kuuuma.com',
      '',
      '언제든지 연락 주세요!',
    ],
  },
  {
    id: 'games', label: '게임 아케이드', emoji: '🕹️',
    tx: 19, ty: 4, tw: 10, th: 8,
    wall: '#1a1a2e', roof: '#e94560',
    lines: [
      '[ 게임 아케이드 ]',
      '',
      '▸ Tower Defense — 전략 타워 디펜스',
      '▸ Survive — 탑다운 슈터 생존',
      '▸ Typing Game — 타이핑 속도 측정',
      '▸ Tetris — 클래식 테트리스',
      '',
      '← 나가서 /games 로 방문하세요!',
    ],
  },
  {
    id: 'aetheria', label: 'AI 연구소', emoji: '🧪',
    tx: 4, ty: 15, tw: 8, th: 5,
    wall: '#4a2d6b', roof: '#2d1b4a',
    lines: [
      '[ Project Aetheria ]',
      '',
      '이 마을 광장(오른쪽 공터)에는',
      'GPT와 Gemini, 두 AI 부족이',
      '실제로 살아 움직이고 있습니다.',
      '',
      '스스로 이동하고, 사냥하고,',
      '거래하고, 때론 죽기도 합니다.',
      '8시간마다 그들의 하루가 흘러갑니다.',
      '',
      '광장에 가서 직접 관찰해보세요.',
    ],
  },
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
  hunt: '🍖 사냥!',
  trade_offer: '💰 거래',
  party_invite: '🤝 협력',
  greeting: '👋 인사',
  move: '🚶 이동',
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
    ctx.fillText('[E] 입장하기', sx + sw / 2, sy - 10)
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
function AetheriaPanel({ data }: { data: { agents: NpcAgent[]; events: AetheriaEvent[]; tick: number } }) {
  const { agents, events, tick } = data
  const alive = agents.filter((a) => a.status === 'alive').length
  const sorted = [...agents].sort((a, b) => b.gold - a.gold)

  if (agents.length === 0) {
    return (
      <p className="font-mono text-sm text-green-100/60">
        아직 시뮬레이션 데이터가 없습니다. 8시간마다 에이전트들의 하루가 진행됩니다.
      </p>
    )
  }

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto font-mono text-sm">
      <p className="text-green-300">
        🕐 {tick}일차 · 💚 생존 {alive}/{agents.length}
      </p>

      {/* 에이전트 현황 */}
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

      {/* 최근 이벤트 로그 */}
      {events.length > 0 && (
        <div className="border-t border-[#4a8a5a]/30 pt-2">
          <p className="mb-1 text-[10px] text-green-700">최근 활동</p>
          <div className="space-y-0.5">
            {events.slice(0, 8).map((e, i) => (
              <p key={i} className="text-[11px] text-green-100/60">
                <span className="text-green-300">{e.agent_name}</span> {e.display_text}
              </p>
            ))}
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
  })
  const [dialog, setDialog] = useState<{ bld: Bld } | null>(null)
  const [started, setStarted] = useState(false)
  // AI 연구소 실시간 현황판용 (React state로 관리해 다이얼로그에서 렌더)
  const [aetheriaData, setAetheriaData] = useState<{ agents: NpcAgent[]; events: AetheriaEvent[]; tick: number }>({
    agents: [],
    events: [],
    tick: 0,
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

    const loop = () => {
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
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(W - mm - 10 + (s.px / TILE) * ms - 2, 14 + (s.py / TILE) * ms - 2, 4, 4)

      // Controls hint
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(10, H - 36, 220, 26)
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '11px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('WASD / 방향키: 이동  |  E: 입장/닫기', 18, H - 18)

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
          <p className="text-green-300/60 font-mono text-sm">탐험하며 포트폴리오를 알아보세요</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono text-green-300/70 border border-green-800 px-8 py-5 rounded-xl bg-black/30">
          <div>🏠 소개의 집</div>
          <div>🏰 스킬 타워</div>
          <div>🏪 프로젝트 상점</div>
          <div>🏛️ 경력 박물관</div>
          <div>📮 연락처 우체국</div>
          <div>🕹️ 게임 아케이드</div>
        </div>

        <div className="text-center text-xs font-mono text-green-400/50 space-y-1">
          <p>WASD / 방향키 — 이동</p>
          <p>E — 건물 입장 / 닫기</p>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-black text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{ boxShadow: '0 0 30px #2d6a2d' }}
        >
          ▶ 게임 시작
        </button>

        <Link href="/" className="text-green-600 hover:text-green-400 text-xs font-mono transition-colors">
          ← 메인으로 돌아가기
        </Link>
      </div>
    )
  }

  // ── Game ─────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-screen overflow-hidden bg-[#1a2e1a] relative" style={{ imageRendering: 'pixelated' }}>
      <canvas ref={canvasRef} className="absolute inset-0" style={{ imageRendering: 'pixelated' }} />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 text-[11px] font-mono text-white/40 hover:text-white/80 bg-black/40 px-3 py-1.5 rounded transition-colors"
      >
        ← 나가기
      </Link>

      {/* Dialog box */}
      {dialog && (
        <div className="absolute inset-0 z-30 flex items-end justify-center pb-12 px-8 pointer-events-none">
          <div
            className="w-full max-w-2xl pointer-events-auto"
            onClick={() => setDialog(null)}
          >
            <div className="bg-[#0a0a1a] border-2 border-[#4a8a5a] rounded-xl p-6 shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(74,138,90,0.4)' }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#4a8a5a]/40">
                <span className="text-2xl">{dialog.bld.emoji}</span>
                <h3 className="text-green-400 font-black font-mono text-sm tracking-wider">
                  {dialog.bld.label}
                </h3>
                <span className="ml-auto text-[10px] font-mono text-green-700">E · ESC 로 닫기</span>
              </div>
              {dialog.bld.id === 'aetheria' ? (
                <AetheriaPanel data={aetheriaData} />
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
            aria-label="입장 / 닫기"
          >
            E
          </button>
        </div>
      )}
    </div>
  )
}
