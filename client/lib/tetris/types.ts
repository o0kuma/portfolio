/** Guideline-style Tetris core types. */

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'

export const TETROMINO_TYPES: TetrominoType[] = [
  'I',
  'J',
  'L',
  'O',
  'S',
  'T',
  'Z',
]

export type RotationIndex = 0 | 1 | 2 | 3

export interface Point {
  x: number
  y: number
}

/** Internal cell value: 0 empty, 1-7 = tetromino type index */
export type Cell = number

export interface GameSettings {
  startLevel: number
  /** Lines to clear to raise level by 1 */
  linesPerLevel: number
  /**
   * Drop interval in ms for level 1. Higher levels get shorter intervals
   * via a multiplier: interval(level) = base * speedCurve(level)
   */
  baseDropIntervalMs: number
  /**
   * Level factor per level above 1, applied as baseDropInterval / (1 + (level-1) * levelSpeedFactor)
   * Kept 0-1; e.g. 0.1 means ~10% faster per level
   */
  levelSpeedFactor: number
  /** Multiplier for soft drop speed (cells per tick vs gravity) */
  softDropFactor: number
  /** Time piece can rest before locking (ms) */
  lockDelayMs: number
  maxLockResetCount: number
  /** DAS/ARR for keyboard-style repeat (ms) */
  initialDelayMs: number
  repeatRateMs: number
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

export interface GameState {
  board: Cell[][]
  current: ActivePiece | null
  nextQueue: TetrominoType[]
  hold: TetrominoType | null
  /** Can't hold again until a piece is locked */
  canHold: boolean
  bag: TetrominoType[]
  level: number
  lines: number
  /** Lines cleared toward next level in current level */
  linesInCurrentLevel: number
  score: number
  status: GameStatus
  /** Combo: increment after a line clear; reset on 0 clear */
  comboCount: number
  /** B2B eligible (last clear was tetris or T-spin with lines) */
  backToBack: boolean
  lastClearWasB2BEligible: boolean
  lockResetCount: number
  /** Accumulated time on ground for current piece (ms) */
  lockTimerMs: number
  /** Elapsed time since last gravity step for current piece */
  gravityAccMs: number
  /** Settings snapshot at game start / restart */
  settings: GameSettings
  lastLockedWasTSpin: boolean
  lastTSpinType: TSpinType | null
  /** DAS: -1 = left, 0 = none, 1 = right; accumulators in ms */
  shiftDirection: -1 | 0 | 1
  shiftHoldMs: number
  /** true after first DAS wait fired; then ARR applies */
  shiftDASCharged: boolean
  /** Last lock: lines cleared (0–4), for UI flash */
  lastLinesCleared: number
  /** Board row indices (0–23) that were cleared on last lock */
  lastClearedRowYs: number[]
}

export interface ActivePiece {
  type: TetrominoType
  x: number
  y: number
  /** Rotation 0-3 (SRS) */
  rotation: RotationIndex
  /** If piece moved down this tick without lock, used for T-spin / slide */
  lastMoveWasRotation: boolean
  lastMoveWasKick: boolean
  /** Kicks that led to the final rotation (for t-spin) */
  lastSrsKicks: Point[]
  /** If last movement was a rotation */
  wasRotatedLast: boolean
}

export type TSpinType = 'none' | 'mini' | 'standard'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 24

export const VISIBLE_TOP_ROW = 4
export const VISIBLE_ROWS = 20
/** Y index of bottom (floor) of stack */
export const FLOOR_Y = 23
/** Spawning uses rows 0-1 buffer + visible */
export const SPAWN_MIN_Y = 0
