'use client'

import type { TetrominoType } from '@/lib/tetris/types'
import { tetrominoColorIndex } from '@/lib/tetris/tetrominoes'
import { getPieceCells } from '@/lib/tetris/tetrominoes'

const COL_CLASSES: Record<number, string> = {
  1: 'bg-cyan-400 border border-cyan-300',
  2: 'bg-blue-600 border border-blue-400',
  3: 'bg-orange-500 border border-orange-400',
  4: 'bg-yellow-400 border border-yellow-300',
  5: 'bg-green-500 border border-green-400',
  6: 'bg-purple-600 border border-purple-400',
  7: 'bg-red-600 border border-red-400',
}

function MiniPiece({ type }: { type: TetrominoType }) {
  const cells = getPieceCells(type, 0)
  const grid = Array.from({ length: 4 }, () => Array(4).fill(0))
  for (const { x, y } of cells) {
    if (y < 4 && x < 4) grid[y][x] = tetrominoColorIndex(type)
  }
  return (
    <div
      className="grid gap-px p-1 bg-slate-900 rounded"
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
    >
      {grid.flat().map((v, i) => (
        <div
          key={i}
          className={`aspect-square w-5 ${v ? COL_CLASSES[v] : 'bg-transparent'}`}
        />
      ))}
    </div>
  )
}

export interface TetrisSidePanelProps {
  hold: TetrominoType | null
  canHold: boolean
  nextQueue: TetrominoType[]
  score: number
  level: number
  lines: number
  comboCount: number
  backToBack: boolean
  highScore: number
}

export default function TetrisSidePanel({
  hold,
  canHold,
  nextQueue,
  score,
  level,
  lines,
  comboCount,
  backToBack,
  highScore,
}: TetrisSidePanelProps) {
  const preview = nextQueue.slice(0, 5)

  return (
    <div className="flex flex-col gap-4 text-sm text-slate-200 min-w-[140px]">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Hold</div>
        <div className={`rounded-lg p-2 bg-slate-900/90 border ${canHold ? 'border-slate-600' : 'border-slate-700 opacity-50'}`}>
          {hold ? <MiniPiece type={hold} /> : <div className="h-[5.5rem] w-[5.5rem]" />}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Next</div>
        <div className="flex flex-col gap-2">
          {preview.map((t, i) => (
            <MiniPiece key={`${t}-${i}`} type={t} />
          ))}
        </div>
      </div>

      <div className="space-y-1 font-mono">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Score</span>
          <span>{score.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">High</span>
          <span>{highScore.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Level</span>
          <span>{level}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Lines</span>
          <span>{lines}</span>
        </div>
        {comboCount >= 0 && (
          <div className="flex justify-between gap-4 text-amber-400">
            <span>Combo</span>
            <span>{comboCount + 1}</span>
          </div>
        )}
        {backToBack && (
          <div className="text-purple-400 text-xs">B2B active</div>
        )}
      </div>
    </div>
  )
}
