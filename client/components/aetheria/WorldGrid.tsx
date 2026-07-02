'use client'

import { useEffect, useRef } from 'react'

interface Agent {
  id: string
  model: 'gpt' | 'gemini'
  name: string
  gold: number
  x: number
  y: number
  status: string
}

const GRID_SIZE = 10
// RPG 페이지와 동일한 캐릭터 컬러 팔레트
const MODEL_BODY: Record<string, string> = { gpt: '#3a7abf', gemini: '#bf5a3a' }
const MODEL_LABEL: Record<string, string> = { gpt: '#93c5fd', gemini: '#fca5a5' }

function drawGrassTile(ctx: CanvasRenderingContext2D, sx: number, sy: number, cell: number, seed: number) {
  ctx.fillStyle = seed % 7 === 0 ? '#4f8a5f' : '#3f6f4c'
  ctx.fillRect(sx, sy, cell, cell)
  if (seed % 11 === 0) {
    ctx.fillStyle = '#5a9a6a'
    ctx.fillRect(sx + cell * 0.2, sy + cell * 0.3, cell * 0.12, cell * 0.08)
    ctx.fillRect(sx + cell * 0.55, sy + cell * 0.6, cell * 0.1, cell * 0.08)
  }
}

// 마을 중심 시장 랜드마크 (Market Economy 컨셉을 시각적으로 표현)
function drawMarket(ctx: CanvasRenderingContext2D, sx: number, sy: number, cell: number) {
  const cx = sx + cell / 2
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(sx + cell * 0.12, sy + cell * 0.42, cell * 0.76, cell * 0.5)
  ctx.fillStyle = '#8b6914'
  ctx.fillRect(sx + cell * 0.15, sy + cell * 0.4, cell * 0.7, cell * 0.5)
  ctx.fillStyle = '#c0522d'
  ctx.beginPath()
  ctx.moveTo(sx + cell * 0.08, sy + cell * 0.42)
  ctx.lineTo(cx, sy + cell * 0.12)
  ctx.lineTo(sx + cell * 0.92, sy + cell * 0.42)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#f5e8c0'
  ctx.font = `${Math.max(8, cell * 0.16)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('🏪', cx, sy + cell * 0.78)
}

function drawAgentSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cell: number,
  model: 'gpt' | 'gemini',
  name: string,
) {
  const w = cell * 0.34
  const h = cell * 0.5
  const x = cx - w / 2
  const y = cy - h

  // 그림자
  ctx.beginPath()
  ctx.ellipse(cx, cy + h * 0.08, w * 0.5, w * 0.18, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fill()

  // 몸통
  ctx.fillStyle = MODEL_BODY[model] ?? '#94a3b8'
  ctx.fillRect(x + w * 0.15, y + h * 0.42, w * 0.7, h * 0.5)

  // 머리
  ctx.fillStyle = '#f0c878'
  ctx.fillRect(x + w * 0.2, y, w * 0.6, h * 0.44)

  // 머리카락
  ctx.fillStyle = '#2a1a0a'
  ctx.fillRect(x + w * 0.2, y, w * 0.6, h * 0.14)

  // 이름표
  ctx.fillStyle = MODEL_LABEL[model] ?? '#e2e8f0'
  ctx.font = `bold ${Math.max(7, cell * 0.14)}px monospace`
  ctx.textAlign = 'center'
  ctx.fillText(name, cx, y - h * 0.12)
}

export default function WorldGrid({ agents }: { agents: Agent[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const cell = size / GRID_SIZE

    // 잔디 필드
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      for (let gx = 0; gx < GRID_SIZE; gx++) {
        drawGrassTile(ctx, gx * cell, gy * cell, cell, gy * 31 + gx * 7)
      }
    }

    // 은은한 격자선
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cell, 0)
      ctx.lineTo(i * cell, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cell)
      ctx.lineTo(size, i * cell)
      ctx.stroke()
    }

    // 중앙 시장 랜드마크
    const mid = Math.floor(GRID_SIZE / 2) - 1
    drawMarket(ctx, mid * cell, mid * cell, cell)

    // 겹치는 칸은 살짝 벌려 배치 (뒤쪽 y부터 그려 앞쪽이 위에 오도록)
    const occupied = new Map<string, number>()
    const sorted = [...agents].filter((a) => a.status === 'alive').sort((a, b) => a.y - b.y)

    for (const agent of sorted) {
      const key = `${agent.x}-${agent.y}`
      const idx = occupied.get(key) ?? 0
      occupied.set(key, idx + 1)
      const offsetX = (idx % 2) * (cell * 0.28) - cell * 0.14

      const cx = agent.x * cell + cell / 2 + offsetX
      const cy = agent.y * cell + cell * 0.78

      drawAgentSprite(ctx, cx, cy, cell, agent.model, agent.name)
    }
  }, [agents])

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-slate-800 bg-[#0f0a05] p-3">
      <div className="mx-auto aspect-square w-full max-w-md" style={{ imageRendering: 'pixelated' }}>
        <canvas ref={canvasRef} width={480} height={480} className="h-full w-full rounded-lg" />
      </div>
      <div className="mt-3 flex justify-center gap-5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODEL_BODY.gpt }} /> GPT
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODEL_BODY.gemini }} /> Gemini
        </span>
        <span className="text-slate-600">🏪 중앙 시장</span>
      </div>
    </div>
  )
}
