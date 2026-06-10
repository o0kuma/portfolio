export type PieceId = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'
export type TetrominoType = PieceId
export const TETROMINO_TYPES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

export type Rotation = 0 | 1 | 2 | 3
export type RotationIndex = Rotation

export interface Point {
  x: number
  y: number
}

export type Cell = number | PieceId
export type BoardMatrix = (0 | PieceId)[][]

export interface ActivePiece {
  /** Legacy engine field */
  id?: PieceId
  /** Guideline engine field */
  type?: TetrominoType
  x: number
  y: number
  rotation: Rotation
  lastMoveWasRotation?: boolean
  lastMoveWasKick?: boolean
  lastSrsKicks?: Point[]
  wasRotatedLast?: boolean
}

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
  /** Progression stage from total lines (1–10). */
  stage: number
  gameOver: boolean
  paused: boolean
}

export type TSpinType = 'none' | 'mini' | 'standard'

export interface GameSettings {
  startLevel: number
  linesPerLevel: number
  baseDropIntervalMs: number
  levelSpeedFactor: number
  softDropFactor: number
  lockDelayMs: number
  maxLockResetCount: number
  initialDelayMs: number
  repeatRateMs: number
}

export interface GameState {
  board: Cell[][]
  current: ActivePiece | null
  nextQueue: TetrominoType[]
  hold: TetrominoType | null
  canHold: boolean
  bag: TetrominoType[]
  level: number
  lines: number
  linesInCurrentLevel: number
  score: number
  status: GameStatus
  comboCount: number
  backToBack: boolean
  lastClearWasB2BEligible: boolean
  lockResetCount: number
  lockTimerMs: number
  gravityAccMs: number
  settings: GameSettings
  lastLockedWasTSpin: boolean
  lastTSpinType: TSpinType | null
  shiftDirection: -1 | 0 | 1
  shiftHoldMs: number
  shiftDASCharged: boolean
  lastLinesCleared: number
  lastClearedRowYs: number[]
}

export const defaultGameSettings: GameSettings = {
  startLevel: 1,
  linesPerLevel: 10,
  baseDropIntervalMs: 1000,
  levelSpeedFactor: 0.12,
  softDropFactor: 20,
  lockDelayMs: 500,
  maxLockResetCount: 15,
  initialDelayMs: 200,
  repeatRateMs: 30,
}

export type GameStatus = 'playing' | 'paused' | 'gameover'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 24
export const VISIBLE_TOP_ROW = 4
export const VISIBLE_ROWS = 20
export const FLOOR_Y = 23
export const SPAWN_MIN_Y = 0
