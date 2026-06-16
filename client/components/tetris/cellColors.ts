import type { PieceId } from '@/lib/tetris/types'

/** Solid fill for locked / active piece */
export function pieceSolidClass(id: PieceId): string {
  const map: Record<PieceId, string> = {
    I: 'bg-cyan-500 dark:bg-cyan-400',
    O: 'bg-amber-400 dark:bg-amber-300',
    J: 'bg-blue-600 dark:bg-blue-500',
    L: 'bg-orange-500 dark:bg-orange-400',
    S: 'bg-emerald-500 dark:bg-emerald-400',
    Z: 'bg-rose-500 dark:bg-rose-400',
    T: 'bg-violet-600 dark:bg-violet-500',
  }
  return map[id]
}

/** Ghost piece — outline + subtle fill */
export function pieceGhostClass(id: PieceId): string {
  const map: Record<PieceId, string> = {
    I: 'border-cyan-400 bg-cyan-400/30',
    O: 'border-amber-300 bg-amber-300/30',
    J: 'border-blue-400 bg-blue-400/30',
    L: 'border-orange-400 bg-orange-400/30',
    S: 'border-emerald-400 bg-emerald-400/30',
    Z: 'border-rose-400 bg-rose-400/30',
    T: 'border-violet-400 bg-violet-400/30',
  }
  return map[id]
}
