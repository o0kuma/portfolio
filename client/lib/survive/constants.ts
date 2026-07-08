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
  // Shorter warm-up (12s) than before — just enough to grab the first
  // upgrade before the swarm starts ramping.
  if (elapsedSec < 12) return 1500 - elapsedSec * 20 // 1500ms → ~1260ms
  return Math.max(180, 1260 - (elapsedSec - 12) * 10)
}

/** Enemy count spawned per wave grows slowly. */
export function spawnBatch(elapsedSec: number): number {
  // Single enemy per wave only through the first 30s, then ramps faster.
  if (elapsedSec < 30) return 1
  return 1 + Math.floor((elapsedSec - 30) / 28)
}

/** Enemy HP scales with time so mid/late game stays tense. */
export function enemyHpScale(elapsedSec: number): number {
  // Soft only through the first 12s, then a steadier climb.
  if (elapsedSec < 12) return 1 + elapsedSec / 100
  return 1 + elapsedSec / 48
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
