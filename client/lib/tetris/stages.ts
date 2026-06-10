/** Progression: one stage every 20 line clears, capped at 10. */
export const LINES_PER_STAGE = 20
export const MAX_STAGE = 10

/** stage = min(10, 1 + floor(totalLines / 20)) */
export function stageFromLines(totalLines: number): number {
  const lines = Math.max(0, Math.floor(totalLines))
  return Math.min(MAX_STAGE, 1 + Math.floor(lines / LINES_PER_STAGE))
}

/** Lines cleared within the current stage (0–19), or 20 when at max stage. */
export function linesIntoCurrentStage(totalLines: number): number {
  if (stageFromLines(totalLines) >= MAX_STAGE) return LINES_PER_STAGE
  return totalLines % LINES_PER_STAGE
}

/** 0–1 progress toward the next stage. */
export function stageProgressRatio(totalLines: number): number {
  if (stageFromLines(totalLines) >= MAX_STAGE) return 1
  return linesIntoCurrentStage(totalLines) / LINES_PER_STAGE
}
