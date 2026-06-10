import { PieceBag } from './bag'
import {
  clearLines,
  getGhostY,
  mergePiece,
  pieceFits,
} from './collision'
import { HARD_DROP_PER_CELL, SOFT_DROP_PER_CELL, lineClearPoints } from './scoring'
import { getSrsKicks, nextRotationCCW, nextRotationCW } from './srs'
import { emptyBoard } from './tetrominoes'
import type { ActivePiece, BoardMatrix, GameSnapshot, PieceId, Rotation } from './types'
import { gravityMsForLevel, levelFromLines } from './levels'
import { stageFromLines } from './stages'

export interface GameEngineState {
  board: BoardMatrix
  piece: ActivePiece | null
  bag: PieceBag
  hold: PieceId | null
  holdLocked: boolean
  score: number
  lines: number
  level: number
  gameOver: boolean
  paused: boolean
}

const SPAWN_X = 3
const SPAWN_Y = 0

function spawn(board: BoardMatrix, bag: PieceBag): ActivePiece | null {
  const id = bag.next()
  const piece: ActivePiece = { id, x: SPAWN_X, y: SPAWN_Y, rotation: 0 }
  if (!pieceFits(board, piece.id, piece.rotation, piece.x, piece.y)) {
    return null
  }
  return piece
}

function deepCopyBoard(board: BoardMatrix): BoardMatrix {
  return board.map((row) => [...row]) as BoardMatrix
}

export function createInitialState(): GameEngineState {
  const board = emptyBoard()
  const bag = new PieceBag()
  const piece = spawn(board, bag)
  return {
    board,
    piece,
    bag,
    hold: null,
    holdLocked: false,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: piece === null,
    paused: false,
  }
}

export function toSnapshot(s: GameEngineState): GameSnapshot {
  const ghostY =
    s.piece && !s.gameOver && !s.paused
      ? getGhostY(s.board, s.piece)
      : null
  return {
    board: s.board,
    piece: s.piece,
    ghostY,
    next: s.bag.peek(5),
    hold: s.hold,
    holdLocked: s.holdLocked,
    score: s.score,
    level: s.level,
    lines: s.lines,
    stage: stageFromLines(s.lines),
    gameOver: s.gameOver,
    paused: s.paused,
  }
}

export function togglePause(s: GameEngineState): GameEngineState {
  if (s.gameOver) return s
  return { ...s, paused: !s.paused }
}

export function moveLeft(s: GameEngineState): GameEngineState {
  if (!s.piece || s.gameOver || s.paused) return s
  const p = s.piece
  if (!pieceFits(s.board, p.id, p.rotation, p.x - 1, p.y)) return s
  return { ...s, piece: { ...p, x: p.x - 1 } }
}

export function moveRight(s: GameEngineState): GameEngineState {
  if (!s.piece || s.gameOver || s.paused) return s
  const p = s.piece
  if (!pieceFits(s.board, p.id, p.rotation, p.x + 1, p.y)) return s
  return { ...s, piece: { ...p, x: p.x + 1 } }
}

export function softDropOne(s: GameEngineState): GameEngineState {
  if (!s.piece || s.gameOver || s.paused) return s
  const p = s.piece
  if (pieceFits(s.board, p.id, p.rotation, p.x, p.y + 1)) {
    return {
      ...s,
      piece: { ...p, y: p.y + 1 },
      score: s.score + SOFT_DROP_PER_CELL,
    }
  }
  return lockPiece(s)
}

function lockPiece(s: GameEngineState): GameEngineState {
  if (!s.piece) return s
  const board = deepCopyBoard(s.board)
  mergePiece(board, s.piece)
  const cleared = clearLines(board)
  let score = s.score
  let lines = s.lines
  let level = s.level

  if (cleared > 0) {
    const cl = Math.min(4, cleared) as 1 | 2 | 3 | 4
    score += lineClearPoints(cl, s.level)
    lines += cleared
    level = levelFromLines(lines)
  }

  const bag = s.bag
  const nextPiece = spawn(board, bag)
  const gameOver = nextPiece === null

  return {
    ...s,
    board,
    piece: nextPiece,
    holdLocked: false,
    score,
    lines,
    level,
    gameOver,
    paused: s.paused,
  }
}

export function hardDrop(s: GameEngineState): GameEngineState {
  if (!s.piece || s.gameOver || s.paused) return s
  const gy = getGhostY(s.board, s.piece)
  const dy = gy - s.piece.y
  const bonus = dy * HARD_DROP_PER_CELL
  const dropped: GameEngineState = {
    ...s,
    piece: { ...s.piece, y: gy },
    score: s.score + bonus,
  }
  return lockPiece(dropped)
}

function tryRotate(s: GameEngineState, nextRot: (r: Rotation) => Rotation): GameEngineState {
  if (!s.piece || s.gameOver || s.paused) return s
  const p = s.piece
  const from = p.rotation
  const to = nextRot(from)
  const kicks = getSrsKicks(p.id, from, to)
  for (const k of kicks) {
    const nx = p.x + k.x
    const ny = p.y + k.y
    if (pieceFits(s.board, p.id, to, nx, ny)) {
      return { ...s, piece: { ...p, x: nx, y: ny, rotation: to } }
    }
  }
  return s
}

export function rotateCW(s: GameEngineState): GameEngineState {
  return tryRotate(s, nextRotationCW)
}

export function rotateCCW(s: GameEngineState): GameEngineState {
  return tryRotate(s, nextRotationCCW)
}

export function gravityStep(s: GameEngineState): GameEngineState {
  if (!s.piece || s.gameOver || s.paused) return s
  const p = s.piece
  if (pieceFits(s.board, p.id, p.rotation, p.x, p.y + 1)) {
    return { ...s, piece: { ...p, y: p.y + 1 } }
  }
  return lockPiece(s)
}

export function hold(s: GameEngineState): GameEngineState {
  if (!s.piece || s.gameOver || s.paused || s.holdLocked) return s
  const currentId = s.piece.id
  const incoming: PieceId = s.hold === null ? s.bag.next() : s.hold
  const testPiece: ActivePiece = {
    id: incoming,
    x: SPAWN_X,
    y: SPAWN_Y,
    rotation: 0,
  }
  if (!pieceFits(s.board, testPiece.id, testPiece.rotation, testPiece.x, testPiece.y)) {
    return { ...s, gameOver: true }
  }
  return {
    ...s,
    piece: testPiece,
    hold: currentId,
    holdLocked: true,
  }
}

export function restart(): GameEngineState {
  return createInitialState()
}

export { gravityMsForLevel }
