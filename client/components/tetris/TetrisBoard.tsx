'use client'

import { COLS, VISIBLE_ROW_START, VISIBLE_ROWS } from '@/lib/tetris/constants'
import { getShapeCells } from '@/lib/tetris/tetrominoes'
import type { GameSnapshot, PieceId } from '@/lib/tetris/types'
import { pieceGhostClass, pieceSolidClass } from './cellColors'

function cellAt(
  snap: GameSnapshot,
  boardRow: number,
  col: number
): { kind: 'empty' } | { kind: 'ghost'; id: PieceId } | { kind: 'piece'; id: PieceId } | { kind: 'board'; id: PieceId } {
  const b = snap.board[boardRow]?.[col]
  if (b !== undefined && b !== 0) return { kind: 'board', id: b }

  if (!snap.piece || snap.gameOver || snap.paused) {
    return { kind: 'empty' }
  }

  const { piece } = snap
  const cells = getShapeCells(piece.id, piece.rotation)
  const ghostY = snap.ghostY ?? piece.y

  for (const [cx, cy] of cells) {
    if (piece.x + cx === col && piece.y + cy === boardRow) {
      return { kind: 'piece', id: piece.id }
    }
  }

  if (ghostY !== piece.y) {
    for (const [cx, cy] of cells) {
      if (piece.x + cx === col && ghostY + cy === boardRow) {
        return { kind: 'ghost', id: piece.id }
      }
    }
  }

  return { kind: 'empty' }
}

export default function TetrisBoard({
  snapshot,
  className = '',
}: {
  snapshot: GameSnapshot
  className?: string
}) {
  return (
    <div
      className={`inline-block rounded-lg border-2 border-slate-300 bg-slate-100 p-1 shadow-sm dark:border-slate-600 dark:bg-slate-900 ${className}`}
      style={{ touchAction: 'none' }}
      role="img"
      aria-label="테트리스 보드"
    >
      <div
        className="grid gap-px bg-slate-300 dark:bg-slate-700"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${VISIBLE_ROWS}, minmax(0, 1fr))`,
          width: 'min(92vw, 360px)',
          aspectRatio: `${COLS} / ${VISIBLE_ROWS}`,
        }}
      >
        {Array.from({ length: VISIBLE_ROWS * COLS }).map((_, i) => {
          const vi = Math.floor(i / COLS)
          const col = i % COLS
          const boardRow = VISIBLE_ROW_START + vi
          const c = cellAt(snapshot, boardRow, col)
          let cls =
            'rounded-[1px] min-h-0 min-w-0 aspect-square bg-slate-50 dark:bg-slate-800/80'
          if (c.kind === 'board' || c.kind === 'piece') {
            cls = `rounded-[2px] min-h-0 min-w-0 aspect-square ${pieceSolidClass(c.id)}`
          } else if (c.kind === 'ghost') {
            cls = `rounded-[2px] min-h-0 min-w-0 aspect-square ${pieceGhostClass(c.id)}`
          }
          return <div key={i} className={cls} />
        })}
      </div>
    </div>
  )
}
