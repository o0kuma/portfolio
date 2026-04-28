/** Approximate Guideline lock delay / gravity interval in ms by level (1-based) */
export function gravityMsForLevel(level: number): number {
  const lv = Math.min(Math.max(level, 1), 20)
  const table: number[] = [
    1000, 793, 617, 473, 355, 262, 190, 135, 95, 67, 47, 33, 23, 16, 11, 8, 6, 5, 4, 3,
  ]
  return table[lv - 1]
}

export function levelFromLines(totalLines: number): number {
  return Math.min(20, 1 + Math.floor(totalLines / 10))
}
