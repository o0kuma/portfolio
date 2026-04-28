'use client'

import { COLS, VISIBLE_ROW_START, VISIBLE_ROWS } from '@/lib/tetris/constants'
import { getShapeCells } from '@/lib/tetris/tetrominoes'
import type { GameSnapshot, PieceId } from '@/lib/tetris/types'
import { pieceGhostClass, pieceSolidClass } from './cellColors'

interface TetrisBoardProps {
  snapshot: GameSnapshot
}

export default function TetrisBoard({ snapshot }: TetrisBoardProps) {
  const piece = snapshot.piece

  const cellAt = (x: number, y: number): 0 | PieceId | 'ghost' => {
    const b = snapshot.board[y]?.[x]
    if (b !== undefined && b !== 0) return b

    if (piece) {
      const id = piece.id || piece.type || 'I'
      const cells = getShapeCells(id, piece.rotation)
      for (const [cx, cy] of cells) {
        if (piece.x + cx === x && piece.y + cy === y) return id
      }
      if (snapshot.ghostY !== null) {
        for (const [cx, cy] of cells) {
          if (piece.x + cx === x && snapshot.ghostY + cy === y) return 'ghost'
        }
      }
    }

    return 0
  }

  return (
    <div
      className="grid rounded-lg bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-700"
      style={{
        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        width: 'min(92vw, 380px)',
      }}
      aria-label="Tetris board"
    >
      {Array.from({ length: VISIBLE_ROWS * COLS }).map((_, idx) => {
        const vy = Math.floor(idx / COLS)
        const x = idx % COLS
        const y = vy + VISIBLE_ROW_START
        const value = cellAt(x, y)

        const base = 'aspect-square border border-slate-800/70 rounded-[2px] bg-slate-800'
        const cls =
          value === 0
            ? base
            : value === 'ghost'
            ? `${base} ${piece ? pieceGhostClass(piece.id || piece.type || 'I') : ''}`
            : `${base} ${pieceSolidClass(value)}`

        return <div key={`${x}-${y}`} className={cls} />
      })}
    </div>
  )
}
