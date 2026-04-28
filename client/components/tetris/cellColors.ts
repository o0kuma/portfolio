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

/** Ghost piece — outline only */
export function pieceGhostClass(id: PieceId): string {
  const map: Record<PieceId, string> = {
    I: 'border-cyan-500/70 bg-cyan-500/15 dark:border-cyan-400/60',
    O: 'border-amber-400/70 bg-amber-400/15',
    J: 'border-blue-600/70 bg-blue-600/15',
    L: 'border-orange-500/70 bg-orange-500/15',
    S: 'border-emerald-500/70 bg-emerald-500/15',
    Z: 'border-rose-500/70 bg-rose-500/15',
    T: 'border-violet-600/70 bg-violet-600/15',
  }
  return `border-2 ${map[id]}`
}
