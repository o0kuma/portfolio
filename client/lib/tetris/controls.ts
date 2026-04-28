/** Touch gesture interpretation for Tetris board */

export type SwipeOutcome =
  | { kind: 'tap' }
  | { kind: 'swipe'; dx: number; dy: number; durationMs: number }

const TAP_MAX_PX = 28
const SWIPE_MIN_PX = 36
/** Fast downward swipe → hard drop */
const HARD_DROP_MIN_DY = 72
const HARD_DROP_MAX_MS = 280

export function analyzeTouchEnd(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  durationMs: number,
): SwipeOutcome {
  const dx = endX - startX
  const dy = endY - startY
  const adx = Math.abs(dx)
  const ady = Math.abs(dy)

  if (adx < TAP_MAX_PX && ady < TAP_MAX_PX) {
    return { kind: 'tap' }
  }

  if (adx < SWIPE_MIN_PX && ady < SWIPE_MIN_PX) {
    return { kind: 'tap' }
  }

  return { kind: 'swipe', dx, dy, durationMs }
}

export function swipeToGameActions(outcome: SwipeOutcome): {
  rotateCW?: boolean
  moveX?: number
  softSteps?: number
  hardDrop?: boolean
} {
  if (outcome.kind === 'tap') {
    return { rotateCW: true }
  }
  const { dx, dy, durationMs } = outcome
  const adx = Math.abs(dx)
  const ady = Math.abs(dy)

  // Down flick → hard drop
  if (
    dy > HARD_DROP_MIN_DY &&
    ady > adx * 1.2 &&
    durationMs <= HARD_DROP_MAX_MS
  ) {
    return { hardDrop: true }
  }

  if (adx >= ady && adx >= SWIPE_MIN_PX) {
    const steps = Math.min(10, Math.floor(adx / 40))
    return { moveX: dx > 0 ? steps : -steps }
  }

  if (dy > ady && dy >= SWIPE_MIN_PX) {
    const steps = Math.min(12, Math.floor(ady / 28))
    return { softSteps: steps }
  }

  if (dy < -SWIPE_MIN_PX && ady > adx) {
    return { rotateCW: true }
  }

  return {}
}
