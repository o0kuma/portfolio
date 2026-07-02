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
const MODEL_COLOR: Record<string, string> = { gpt: '#10b981', gemini: '#3b82f6' }

export default function WorldGrid({ agents }: { agents: Agent[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const cell = size / GRID_SIZE

    // 배경
    ctx.fillStyle = '#0a1a12'
    ctx.fillRect(0, 0, size, size)

    // 그리드 라인 (RPG 필드 느낌의 은은한 격자)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
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

    // 타일 텍스처 (체크무늬로 필드감)
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      for (let gx = 0; gx < GRID_SIZE; gx++) {
        if ((gx + gy) % 2 === 0) {
          ctx.fillRect(gx * cell, gy * cell, cell, cell)
        }
      }
    }

    // 같은 칸에 여러 에이전트가 있으면 살짝 벌려서 그림
    const occupied = new Map<string, number>()

    for (const agent of agents) {
      if (agent.status !== 'alive') continue
      const key = `${agent.x}-${agent.y}`
      const idx = occupied.get(key) ?? 0
      occupied.set(key, idx + 1)

      const offsetX = (idx % 2) * (cell * 0.22) - cell * 0.11
      const cx = agent.x * cell + cell / 2 + offsetX
      const cy = agent.y * cell + cell / 2

      // 그림자
      ctx.beginPath()
      ctx.ellipse(cx, cy + cell * 0.22, cell * 0.18, cell * 0.06, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fill()

      // 에이전트 원
      const r = cell * 0.22
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = MODEL_COLOR[agent.model] ?? '#94a3b8'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 이니셜
      ctx.fillStyle = '#0a0a0a'
      ctx.font = `bold ${Math.max(8, r)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(agent.name.slice(0, 1), cx, cy)
      ctx.textBaseline = 'alphabetic'
    }
  }, [agents])

  return (
    <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <div className="mx-auto aspect-square w-full max-w-md">
        <canvas ref={canvasRef} width={480} height={480} className="h-full w-full rounded-lg" />
      </div>
      <div className="mt-3 flex justify-center gap-5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODEL_COLOR.gpt }} /> GPT
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODEL_COLOR.gemini }} /> Gemini
        </span>
      </div>
    </div>
  )
}
