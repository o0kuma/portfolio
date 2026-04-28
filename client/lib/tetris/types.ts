/** Tetromino identifiers */
export type PieceId = 'I' | 'O' | 'J' | 'L' | 'S' | 'Z' | 'T'

export const PIECE_IDS: PieceId[] = ['I', 'O', 'J', 'L', 'S', 'Z', 'T']

export interface Vec2 {
  x: number
  y: number
}

/** Rotation index 0..3 */
export type Rotation = 0 | 1 | 2 | 3

export interface ActivePiece {
  id: PieceId
  x: number
  y: number
  rotation: Rotation
}

export type BoardMatrix = (0 | PieceId)[][]

export interface GameSnapshot {
  board: BoardMatrix
  piece: ActivePiece | null
  ghostY: number | null
  next: PieceId[]
  hold: PieceId | null
  holdLocked: boolean
  score: number
  level: number
  lines: number
  gameOver: boolean
  paused: boolean
}
