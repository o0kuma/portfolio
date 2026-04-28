import type { GameSettings } from './types'

export type DifficultyPresetId = 'relaxed' | 'standard' | 'sprint'

export const presets: Record<DifficultyPresetId, GameSettings> = {
  relaxed: {
    startLevel: 1,
    linesPerLevel: 15,
    baseDropIntervalMs: 1200,
    levelSpeedFactor: 0.08,
    softDropFactor: 18,
    lockDelayMs: 700,
    maxLockResetCount: 18,
    initialDelayMs: 220,
    repeatRateMs: 35,
  },
  standard: {
    startLevel: 1,
    linesPerLevel: 10,
    baseDropIntervalMs: 1000,
    levelSpeedFactor: 0.12,
    softDropFactor: 20,
    lockDelayMs: 500,
    maxLockResetCount: 15,
    initialDelayMs: 200,
    repeatRateMs: 30,
  },
  sprint: {
    startLevel: 5,
    linesPerLevel: 10,
    baseDropIntervalMs: 700,
    levelSpeedFactor: 0.15,
    softDropFactor: 24,
    lockDelayMs: 400,
    maxLockResetCount: 12,
    initialDelayMs: 170,
    repeatRateMs: 25,
  },
}
