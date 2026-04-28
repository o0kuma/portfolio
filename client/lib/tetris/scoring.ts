/** Guideline-style line clear score (before level multiplier applied in caller) */
export function baseLineScore(lines: 1 | 2 | 3 | 4): number {
  switch (lines) {
    case 1:
      return 100
    case 2:
      return 300
    case 3:
      return 500
    case 4:
      return 800
    default:
      return 0
  }
}

export function lineClearPoints(lines: 1 | 2 | 3 | 4, level: number): number {
  return baseLineScore(lines) * level
}

export const SOFT_DROP_PER_CELL = 1
export const HARD_DROP_PER_CELL = 2
