import type { ActivePiece, Cell, Point, TetrominoType } from './types'
import { BOARD_HEIGHT, BOARD_WIDTH } from './types'
import { getPieceCells, tetrominoColorIndex } from './tetrominoes'

export function emptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => 0 as Cell),
  )
}

export function pieceWorldCells(piece: ActivePiece): Point[] {
  return getPieceCells(piece.type, piece.rotation).map((c) => ({
    x: c.x + piece.x,
    y: c.y + piece.y,
  }))
}

export function isValidPosition(
  board: Cell[][],
  piece: ActivePiece,
  ox = 0,
  oy = 0,
  rotation?: ActivePiece['rotation'],
): boolean {
  const r = rotation ?? piece.rotation
  const cells = getPieceCells(piece.type, r).map((c) => ({
    x: c.x + piece.x + ox,
    y: c.y + piece.y + oy,
  }))
  for (const { x, y } of cells) {
    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false
    if (y >= 0 && board[y][x] !== 0) return false
  }
  return true
}

export function mergePiece(board: Cell[][], piece: ActivePiece): void {
  const val = tetrominoColorIndex(piece.type)
  for (const { x, y } of pieceWorldCells(piece)) {
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
      board[y][x] = val
    }
  }
}

export function clearLines(board: Cell[][]): number {
  let cleared = 0
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every((c) => c !== 0)) {
      board.splice(y, 1)
      board.unshift(Array.from({ length: BOARD_WIDTH }, () => 0 as Cell))
      cleared++
      y++
    }
  }
  return cleared
}

/** Lowest Y if piece dropped until collision */
export function getGhostY(board: Cell[][], piece: ActivePiece): number {
  let dy = 0
  while (isValidPosition(board, piece, 0, dy + 1)) dy++
  return piece.y + dy
}

export function spawnPiece(type: TetrominoType): ActivePiece {
  const x = type === 'I' ? 3 : 3
  const y = type === 'I' ? -1 : 0
  return {
    type,
    x,
    y,
    rotation: 0,
    lastMoveWasRotation: false,
    lastMoveWasKick: false,
    lastSrsKicks: [],
    wasRotatedLast: false,
  }
}
