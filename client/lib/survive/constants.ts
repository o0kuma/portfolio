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
  // Warm-up: the first ~18s spawn slowly so a fresh run can grab its first
  // couple of upgrades before the swarm ramps up.
  if (elapsedSec < 18) return 1700 - elapsedSec * 22 // 1700ms → ~1300ms
  return Math.max(220, 1300 - (elapsedSec - 18) * 9)
}

/** Enemy count spawned per wave grows slowly. */
export function spawnBatch(elapsedSec: number): number {
  // Stay at a single enemy per wave through the opening so it never feels
  // like a wall on spawn.
  if (elapsedSec < 45) return 1
  return 1 + Math.floor((elapsedSec - 45) / 35)
}

/** Enemy HP scales gently with time so late game stays tense. */
export function enemyHpScale(elapsedSec: number): number {
  // Softer early scaling so opening enemies die in ~2 hits, then ramps in.
  if (elapsedSec < 20) return 1 + elapsedSec / 120
  return 1 + elapsedSec / 60
}

export const HIGH_SCORE_KEY = 'survive-best'
export const SURVIVE_SESSION_ID_KEY = 'survive-session-id'
export const SURVIVE_PLAYER_NAME_KEY = 'survive-player-name'

/** Local best record shape persisted to localStorage. */
export type SurviveBest = {
  timeSec: number
  level: number
  kills: number
}
