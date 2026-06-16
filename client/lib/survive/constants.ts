/** Survive (뱀서라이크) — balance & world constants */

/** Logical world size the camera follows the player across. Camera centers on player. */
export const WORLD_WIDTH = 2000
export const WORLD_HEIGHT = 2000

export const PLAYER_RADIUS = 14
export const PLAYER_MAX_HP = 100
export const PLAYER_BASE_SPEED = 175 // px/s
export const PLAYER_INVULN_MS = 600 // i-frames after taking a hit

/** Base XP gem pickup range; upgradable. */
export const BASE_PICKUP_RANGE = 70

/** XP curve: xp needed for next level. */
export function xpForLevel(level: number): number {
  return Math.floor(5 + level * 4 + level * level * 1.2)
}

/** Enemy spawn cadence shrinks over time (ms between spawns). */
export function spawnIntervalMs(elapsedSec: number): number {
  return Math.max(220, 1100 - elapsedSec * 9)
}

/** Enemy count spawned per wave grows slowly. */
export function spawnBatch(elapsedSec: number): number {
  return 1 + Math.floor(elapsedSec / 35)
}

/** Enemy HP scales gently with time so late game stays tense. */
export function enemyHpScale(elapsedSec: number): number {
  return 1 + elapsedSec / 60
}

export const HIGH_SCORE_KEY = 'survive-best'

/** Local best record shape persisted to localStorage. */
export type SurviveBest = {
  timeSec: number
  level: number
  kills: number
}
