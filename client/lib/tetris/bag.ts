import type { PieceId } from './types'
import { PIECE_IDS } from './types'

export function createBag(): PieceId[] {
  const bag = [...PIECE_IDS]
  shuffleInPlace(bag)
  return bag
}

function shuffleInPlace(arr: PieceId[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

/** 7-bag randomizer with peek support */
export class PieceBag {
  private queue: PieceId[] = []

  private refill(): void {
    this.queue.push(...createBag())
  }

  next(): PieceId {
    if (this.queue.length === 0) this.refill()
    return this.queue.shift()!
  }

  peek(n: number): PieceId[] {
    while (this.queue.length < n) this.refill()
    return this.queue.slice(0, n)
  }
}
