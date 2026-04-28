import { COLS, ROWS } from './constants'
import { getShapeCells } from './tetrominoes'
import type { ActivePiece, BoardMatrix, PieceId, Rotation } from './types'

export function pieceFits(
  board: BoardMatrix,
  id: PieceId,
  rot: Rotation,
  px: number,
  py: number
): boolean {
  const cells = getShapeCells(id, rot)
  for (const [cx, cy] of cells) {
    const x = px + cx
    const y = py + cy
    if (x < 0 || x >= COLS || y >= ROWS) return false
    if (y >= 0 && board[y][x] !== 0) return false
  }
  return true
}

export function mergePiece(board: BoardMatrix, piece: ActivePiece): void {
  const cells = getShapeCells(piece.id, piece.rotation)
  for (const [cx, cy] of cells) {
    const x = piece.x + cx
    const y = piece.y + cy
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
      board[y][x] = piece.id
    }
  }
}

export function clearLines(board: BoardMatrix): number {
  let cleared = 0
  let y = ROWS - 1
  while (y >= 0) {
    if (board[y].every((c) => c !== 0)) {
      board.splice(y, 1)
      board.unshift(Array<0 | PieceId>(COLS).fill(0))
      cleared++
    } else {
      y--
    }
  }
  return cleared
}

/** Lowest y where piece would rest (ghost) */
export function getGhostY(board: BoardMatrix, piece: ActivePiece): number {
  let gy = piece.y
  while (pieceFits(board, piece.id, piece.rotation, piece.x, gy + 1)) {
    gy++
  }
  return gy
}
