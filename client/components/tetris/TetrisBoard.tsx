'use client'

import { COLS, VISIBLE_ROW_START, VISIBLE_ROWS } from '@/lib/tetris/constants'
import { getShapeCells } from '@/lib/tetris/tetrominoes'
import type { GameSnapshot, PieceId } from '@/lib/tetris/types'
import { pieceGhostClass, pieceSolidClass } from './cellColors'

/** Legacy 엔진이 보드에 색 인덱스(1–7)만 넣은 경우에도 칠하기 위함 */
const COLOR_INDEX_TO_PIECE: Record<number, PieceId> = {
  1: 'I',
  2: 'J',
  3: 'L',
  4: 'O',
  5: 'S',
  6: 'T',
  7: 'Z',
}

function lockedCellToPieceId(raw: unknown): PieceId | null {
  if (raw === undefined || raw === 0) return null
  if (typeof raw === 'string' && 'IJLOSTZ'.includes(raw)) {
    return raw as PieceId
  }
  if (typeof raw === 'number' && raw >= 1 && raw <= 7) {
    return COLOR_INDEX_TO_PIECE[raw] ?? null
  }
  return null
}

interface TetrisBoardProps {
  snapshot: GameSnapshot
}

export default function TetrisBoard({ snapshot }: TetrisBoardProps) {
  const piece = snapshot.piece

  const cellAt = (x: number, y: number): 0 | PieceId | 'ghost' => {
    const locked = lockedCellToPieceId(snapshot.board[y]?.[x])
    if (locked !== null) return locked

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
