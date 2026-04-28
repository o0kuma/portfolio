'use client'

import { motion } from 'framer-motion'
import type { ActivePiece, Cell } from '@/lib/tetris/types'
import { BOARD_WIDTH, VISIBLE_TOP_ROW } from '@/lib/tetris/types'
import { pieceWorldCells } from '@/lib/tetris/board'
import { tetrominoColorIndex } from '@/lib/tetris/tetrominoes'

const ROW_OFFSET = VISIBLE_TOP_ROW
const VISIBLE_ROWS = 20

const COL_CLASSES: Record<number, string> = {
  0: '',
  1: 'bg-cyan-400 shadow-inner border border-cyan-300',
  2: 'bg-blue-600 shadow-inner border border-blue-400',
  3: 'bg-orange-500 shadow-inner border border-orange-400',
  4: 'bg-yellow-400 shadow-inner border border-yellow-300',
  5: 'bg-green-500 shadow-inner border border-green-400',
  6: 'bg-purple-600 shadow-inner border border-purple-400',
  7: 'bg-red-600 shadow-inner border border-red-400',
}

function pieceOverlaySet(piece: ActivePiece | null): Set<string> {
  const s = new Set<string>()
  if (!piece) return s
  for (const { x, y } of pieceWorldCells(piece)) {
    if (y >= ROW_OFFSET && y < ROW_OFFSET + VISIBLE_ROWS && x >= 0 && x < BOARD_WIDTH) {
      s.add(`${x},${y}`)
    }
  }
  return s
}

export interface TetrisBoardProps {
  board: Cell[][]
  current: ActivePiece | null
  ghost: ActivePiece | null
  /** Visible row indices 0..19 to flash */
  flashVisibleRows?: number[]
}

export default function TetrisBoard({
  board,
  current,
  ghost,
  flashVisibleRows = [],
}: TetrisBoardProps) {
  const currentSet = pieceOverlaySet(current)
  const ghostSet = pieceOverlaySet(ghost)
  const ghostOnly = new Set<string>()
  ghostSet.forEach((k) => {
    if (!currentSet.has(k)) ghostOnly.add(k)
  })

  const flashRows = new Set(flashVisibleRows)

  return (
    <div
      className="inline-grid gap-px p-2 rounded-xl bg-slate-900/80 border border-slate-600 shadow-xl touch-none select-none"
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${VISIBLE_ROWS}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: VISIBLE_ROWS * BOARD_WIDTH }, (_, i) => {
        const vr = Math.floor(i / BOARD_WIDTH)
        const x = i % BOARD_WIDTH
        const y = vr + ROW_OFFSET
        const key = `${x},${y}`
        let cellVal = board[y]?.[x] ?? 0

        if (currentSet.has(key)) {
          if (current) cellVal = tetrominoColorIndex(current.type)
        } else if (ghostOnly.has(key) && current) {
          cellVal = tetrominoColorIndex(current.type)
        }

        const ghostMode = ghostOnly.has(key)
        const cls = COL_CLASSES[cellVal] ?? 'bg-slate-800'
        const flash = flashRows.has(y)

        return (
          <motion.div
            key={`${vr}-${x}`}
            className={`aspect-square min-w-[14px] max-w-[36px] w-full rounded-sm ${cls} ${
              ghostMode ? 'opacity-35 border border-dashed border-white/40' : ''
            } ${flash ? 'ring-2 ring-white/90 z-10' : ''}`}
            animate={
              flash
                ? { scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }
                : {}
            }
            transition={{ duration: 0.35 }}
          />
        )
      })}
    </div>
  )
}
