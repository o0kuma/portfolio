import type {
  ActivePiece,
  Cell,
  GameSettings,
  GameState,
  RotationIndex,
  TetrominoType,
  TSpinType,
} from './types'
import { BOARD_HEIGHT, BOARD_WIDTH, defaultGameSettings } from './types'
import { newBag, pullFromBag } from './bag'
import {
  emptyBoard,
  getGhostY,
  isValidPosition,
  mergePiece,
  spawnPiece,
  clearLines,
} from './board'
import {
  getSrsKicks,
  nextRotationCCW,
  nextRotationCW,
} from './srs'
import { computeClearScore, getDropIntervalMs } from './scoring'

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => [...row])
}

function fillNextQueue(bag: TetrominoType[], q: TetrominoType[]): void {
  while (q.length < 5) {
    q.push(pullFromBag(bag))
  }
}

function dequeueSpawn(queue: TetrominoType[], bag: TetrominoType[]): TetrominoType {
  const t = queue.shift()!
  fillNextQueue(bag, queue)
  return t
}

export function createInitialState(
  settings: GameSettings = defaultGameSettings,
): GameState {
  const bag = newBag()
  const nextQueue: TetrominoType[] = []
  fillNextQueue(bag, nextQueue)
  const first = dequeueSpawn(nextQueue, bag)
  const current = spawnPiece(first)
  const board = emptyBoard()

  if (!isValidPosition(board, current)) {
    return {
      board,
      current: null,
      nextQueue,
      hold: null,
      canHold: true,
      bag,
      level: settings.startLevel,
      lines: 0,
      linesInCurrentLevel: 0,
      score: 0,
      status: 'gameover',
      comboCount: -1,
      backToBack: false,
      lastClearWasB2BEligible: false,
      lockResetCount: 0,
      lockTimerMs: 0,
      gravityAccMs: 0,
      settings,
      lastLockedWasTSpin: false,
      lastTSpinType: null,
      shiftDirection: 0,
      shiftHoldMs: 0,
      shiftDASCharged: false,
      lastLinesCleared: 0,
      lastClearedRowYs: [],
    }
  }

  return {
    board,
    current,
    nextQueue,
    hold: null,
    canHold: true,
    bag,
    level: settings.startLevel,
    lines: 0,
    linesInCurrentLevel: 0,
    score: 0,
    status: 'playing',
    comboCount: -1,
    backToBack: false,
    lastClearWasB2BEligible: false,
    lockResetCount: 0,
    lockTimerMs: 0,
    gravityAccMs: 0,
    settings,
    lastLockedWasTSpin: false,
    lastTSpinType: null,
    shiftDirection: 0,
    shiftHoldMs: 0,
    shiftDASCharged: false,
    lastLinesCleared: 0,
    lastClearedRowYs: [],
  }
}

export function restartGame(settings: GameSettings): GameState {
  return createInitialState(settings)
}

export function setPaused(state: GameState, paused: boolean): GameState {
  if (state.status === 'gameover') return state
  return {
    ...state,
    status: paused ? 'paused' : 'playing',
  }
}

function onGround(board: Cell[][], piece: ActivePiece): boolean {
  return !isValidPosition(board, piece, 0, 1)
}

function cornerOcc(board: Cell[][], cx: number, cy: number): boolean {
  if (cx < 0 || cx >= BOARD_WIDTH || cy >= BOARD_HEIGHT) return true
  if (cy < 0) return false
  return board[cy][cx] !== 0
}

/** Guideline-style T-spin detection using 4 corners around T center */
function detectTSpin(
  board: Cell[][],
  piece: ActivePiece,
): { kind: TSpinType } {
  if (piece.type !== 'T' || !piece.wasRotatedLast) return { kind: 'none' }
  const cx = piece.x + 1
  const cy = piece.y + 1
  const corners = [
    cornerOcc(board, cx - 1, cy - 1),
    cornerOcc(board, cx + 1, cy - 1),
    cornerOcc(board, cx - 1, cy + 1),
    cornerOcc(board, cx + 1, cy + 1),
  ]
  const filled = corners.filter(Boolean).length
  if (filled < 3) return { kind: 'none' }
  // Mini: exactly 3 corners and front-facing pair not both filled (simplified: 3 corners + kick)
  if (filled === 3 && piece.lastMoveWasKick) return { kind: 'mini' }
  return { kind: 'standard' }
}

function applyLevelUp(
  state: GameState,
  linesCleared: number,
): Pick<GameState, 'level' | 'linesInCurrentLevel'> {
  const { settings } = state
  let level = state.level
  let lic = state.linesInCurrentLevel + linesCleared
  while (lic >= settings.linesPerLevel) {
    lic -= settings.linesPerLevel
    level += 1
  }
  return { level, linesInCurrentLevel: lic }
}

function spawnOrGameOver(
  state: GameState,
  board: Cell[][],
): GameState {
  const piece = spawnPiece(dequeueSpawn(state.nextQueue, state.bag))
  if (!isValidPosition(board, piece)) {
    return {
      ...state,
      board,
      current: null,
      status: 'gameover',
    }
  }
  return {
    ...state,
    board,
    current: piece,
    canHold: true,
    lockTimerMs: 0,
    gravityAccMs: 0,
    lockResetCount: 0,
    lastLockedWasTSpin: false,
    lastTSpinType: null,
  }
}

function lockPieceAndSpawn(state: GameState, softCells: number, hardCells: number): GameState {
  const { board: b0, current: piece } = state
  if (!piece) return state
  const board = cloneBoard(b0)
  mergePiece(board, piece)

  const clearedRowsBefore: number[] = []
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every((c) => c !== 0)) clearedRowsBefore.push(y)
  }

  const tspin = detectTSpin(board, piece)
  const linesCleared = clearLines(board)

  let comboCount = state.comboCount
  let scoreAdd = 0
  let backToBack = state.backToBack
  let lastClearB2B = state.lastClearWasB2BEligible

  const isTSpinLine = tspin.kind !== 'none' && linesCleared > 0
  const isTetris = linesCleared === 4
  const isB2BEligible = isTetris || isTSpinLine

  if (linesCleared === 0) {
    comboCount = -1
    const dropScore = computeClearScore(
      {
        linesCleared: 0,
        level: state.level,
        isB2BEligible: false,
        previousB2B: state.lastClearWasB2BEligible,
        comboTier: 0,
        tSpin: 'none',
        hardDropCells: hardCells,
        softDropCells: softCells,
      },
      state.settings,
    )
    scoreAdd += dropScore.score
  } else {
    comboCount += 1
    const comboTier = comboCount + 1
    const clearRes = computeClearScore(
      {
        linesCleared,
        level: state.level,
        isB2BEligible,
        previousB2B: state.lastClearWasB2BEligible,
        comboTier,
        tSpin: tspin.kind === 'none' ? 'none' : tspin.kind,
        hardDropCells: hardCells,
        softDropCells: softCells,
      },
      state.settings,
    )
    scoreAdd += clearRes.score
    backToBack = clearRes.newB2B
    lastClearB2B = isB2BEligible
  }

  const linesTotal = state.lines + linesCleared
  const levelState = applyLevelUp(
    { ...state, lines: linesTotal, level: state.level, linesInCurrentLevel: state.linesInCurrentLevel },
    linesCleared,
  )

  let next: GameState = {
    ...state,
    board,
    lines: linesTotal,
    level: levelState.level,
    linesInCurrentLevel: levelState.linesInCurrentLevel,
    score: state.score + scoreAdd,
    comboCount: linesCleared === 0 ? -1 : comboCount,
    backToBack,
    lastClearWasB2BEligible: lastClearB2B,
    lastLockedWasTSpin: tspin.kind !== 'none',
    lastTSpinType: linesCleared > 0 ? tspin.kind : null,
    shiftDirection: 0,
    shiftHoldMs: 0,
    shiftDASCharged: false,
    lastLinesCleared: linesCleared,
    lastClearedRowYs: clearedRowsBefore,
  }

  next = spawnOrGameOver(next, board)
  return next
}

export interface TickInput {
  softDrop: boolean
  moveLeft: boolean
  moveRight: boolean
}

export function gameTick(state: GameState, dtMs: number, input: TickInput): GameState {
  if (state.status !== 'playing' || !state.current) return state

  let s = { ...state }
  let piece = { ...s.current }
  let softCells = 0
  let hardCells = 0

  const settings = s.settings
  const interval = getDropIntervalMs(s.level, settings) / (input.softDrop ? settings.softDropFactor : 1)

  // Shift / DAS
  let dir: -1 | 0 | 1 = 0
  if (input.moveLeft && !input.moveRight) dir = -1
  else if (input.moveRight && !input.moveLeft) dir = 1

  if (dir !== 0) {
    if (s.shiftDirection !== dir) {
      s.shiftDirection = dir
      s.shiftHoldMs = 0
      s.shiftDASCharged = false
      if (isValidPosition(s.board, piece, dir, 0)) {
        piece.x += dir
        piece.lastMoveWasRotation = false
        piece.wasRotatedLast = false
        if (onGround(s.board, piece)) {
          if (s.lockResetCount < settings.maxLockResetCount) {
            s.lockTimerMs = 0
            s.lockResetCount += 1
          }
        }
      }
    } else {
      s.shiftHoldMs += dtMs
      const initial = settings.initialDelayMs
      const repeat = settings.repeatRateMs
      if (!s.shiftDASCharged) {
        if (s.shiftHoldMs >= initial) {
          s.shiftHoldMs -= initial
          s.shiftDASCharged = true
          if (isValidPosition(s.board, piece, dir, 0)) {
            piece.x += dir
            piece.lastMoveWasRotation = false
            piece.wasRotatedLast = false
            if (
              onGround(s.board, piece) &&
              s.lockResetCount < settings.maxLockResetCount
            ) {
              s.lockTimerMs = 0
              s.lockResetCount += 1
            }
          }
        }
      }
      while (s.shiftDASCharged && s.shiftHoldMs >= repeat) {
        s.shiftHoldMs -= repeat
        if (isValidPosition(s.board, piece, dir, 0)) {
          piece.x += dir
          piece.lastMoveWasRotation = false
          piece.wasRotatedLast = false
          if (
            onGround(s.board, piece) &&
            s.lockResetCount < settings.maxLockResetCount
          ) {
            s.lockTimerMs = 0
            s.lockResetCount += 1
          }
        } else break
      }
    }
  } else {
    s.shiftDirection = 0
    s.shiftHoldMs = 0
    s.shiftDASCharged = false
  }

  const grounded = onGround(s.board, piece)

  // Gravity
  s.gravityAccMs += dtMs
  while (s.gravityAccMs >= interval) {
    s.gravityAccMs -= interval
    if (isValidPosition(s.board, piece, 0, 1)) {
      piece.y += 1
      piece.lastMoveWasRotation = false
      piece.wasRotatedLast = false
      softCells += input.softDrop ? 1 : 0
      if (!onGround(s.board, piece)) {
        s.lockTimerMs = 0
        s.lockResetCount = 0
      }
    } else break
  }

  const groundedAfter = onGround(s.board, piece)

  if (groundedAfter) {
    s.lockTimerMs += dtMs
    if (s.lockTimerMs >= settings.lockDelayMs || s.lockResetCount >= settings.maxLockResetCount) {
      return lockPieceAndSpawn({ ...s, current: piece }, softCells, hardCells)
    }
  } else {
    s.lockTimerMs = 0
  }

  return { ...s, current: piece }
}

function tryRotate(state: GameState, cw: boolean): GameState {
  if (state.status !== 'playing' || !state.current) return state
  const piece0 = state.current
  const from = piece0.rotation
  const to = (cw ? nextRotationCW(from) : nextRotationCCW(from)) as RotationIndex
  const kicks = getSrsKicks(piece0.type, from, to)
  for (let i = 0; i < kicks.length; i++) {
    const k = kicks[i]!
    const test: ActivePiece = {
      ...piece0,
      rotation: to,
      x: piece0.x + k.x,
      y: piece0.y + k.y,
      lastMoveWasRotation: true,
      lastMoveWasKick: i > 0,
      lastSrsKicks: kicks.slice(0, i + 1),
      wasRotatedLast: true,
    }
    if (isValidPosition(state.board, test)) {
      let s = { ...state, current: test }
      if (onGround(state.board, test) && state.lockResetCount < state.settings.maxLockResetCount) {
        s.lockTimerMs = 0
        s.lockResetCount = state.lockResetCount + 1
      }
      return s
    }
  }
  return state
}

export function rotateCW(state: GameState): GameState {
  return tryRotate(state, true)
}

export function rotateCCW(state: GameState): GameState {
  return tryRotate(state, false)
}

export function softDropStep(state: GameState): GameState {
  return gameTick(state, getDropIntervalMs(state.level, state.settings) / state.settings.softDropFactor, {
    softDrop: true,
    moveLeft: false,
    moveRight: false,
  })
}

export function hardDrop(state: GameState): GameState {
  if (state.status !== 'playing' || !state.current) return state
  let piece = { ...state.current }
  let cells = 0
  while (isValidPosition(state.board, piece, 0, 1)) {
    piece.y += 1
    cells++
  }
  return lockPieceAndSpawn({ ...state, current: piece }, 0, cells)
}

export function holdSwap(state: GameState): GameState {
  if (state.status !== 'playing' || !state.current || !state.canHold) return state
  const curType = state.current.type
  let hold = state.hold
  let nextType: TetrominoType
  if (hold === null) {
    nextType = dequeueSpawn(state.nextQueue, state.bag)
  } else {
    nextType = hold
  }
  hold = curType
  const piece = spawnPiece(nextType)
  if (!isValidPosition(state.board, piece)) {
    return { ...state, status: 'gameover', current: null }
  }
  return {
    ...state,
    hold,
    current: piece,
    canHold: false,
    lockTimerMs: 0,
    gravityAccMs: 0,
    lockResetCount: 0,
  }
}

export function moveOnce(state: GameState, dx: number, dy: number): GameState {
  if (state.status !== 'playing' || !state.current) return state
  const piece = { ...state.current }
  if (!isValidPosition(state.board, piece, dx, dy)) return state
  piece.x += dx
  piece.y += dy
  piece.lastMoveWasRotation = false
  piece.wasRotatedLast = false
  let s: GameState = { ...state, current: piece }
  if (onGround(state.board, piece) && dy === 0 && s.lockResetCount < state.settings.maxLockResetCount) {
    s.lockTimerMs = 0
    s.lockResetCount += 1
  }
  if (!onGround(state.board, piece)) {
    s.lockTimerMs = 0
    s.lockResetCount = 0
  }
  return s
}

export function getGhostPiece(state: GameState): ActivePiece | null {
  if (!state.current) return null
  const gy = getGhostY(state.board, state.current)
  return { ...state.current, y: gy }
}

/** Occupied cells for rendering including ghost outline */
export function getOccupiedForRender(state: GameState): {
  board: Cell[][]
  current: ActivePiece | null
  ghost: ActivePiece | null
} {
  return {
    board: state.board,
    current: state.current,
    ghost: state.status === 'playing' ? getGhostPiece(state) : null,
  }
}
