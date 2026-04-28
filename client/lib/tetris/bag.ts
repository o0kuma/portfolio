import type { TetrominoType } from './types'
import { TETROMINO_TYPES } from './types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function newBag(): TetrominoType[] {
  return shuffle([...TETROMINO_TYPES])
}

export function pullFromBag(bag: TetrominoType[]): TetrominoType {
  if (bag.length === 0) {
    bag.push(...newBag())
  }
  return bag.shift()!
}
