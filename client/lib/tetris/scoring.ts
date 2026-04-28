import type { GameSettings } from './types'
import type { TSpinType } from './types'

export interface ClearScoreInput {
  linesCleared: number
  level: number
  /** Tetris / T-spin lines are B2B eligible */
  isB2BEligible: boolean
  previousB2B: boolean
  /** Combo tier: 1 = first consecutive clear with lines, 2 = second, ... */
  comboTier: number
  tSpin: TSpinType
  hardDropCells: number
  softDropCells: number
}

export function computeClearScore(
  input: ClearScoreInput,
  _settings: GameSettings,
): { score: number; newB2B: boolean } {
  const { level } = input
  let base = 0

  if (input.linesCleared === 0) {
    const soft = input.softDropCells
    const hard = input.hardDropCells * 2
    return { score: soft + hard, newB2B: input.previousB2B }
  }

  const t = input.tSpin
  if (t !== 'none' && input.linesCleared > 0) {
    if (input.linesCleared === 1) {
      base = t === 'mini' ? 200 * level : 800 * level
    } else if (input.linesCleared === 2) {
      base = 1200 * level
    } else if (input.linesCleared === 3) {
      base = 1600 * level
    }
  } else {
    switch (input.linesCleared) {
      case 1:
        base = 100 * level
        break
      case 2:
        base = 300 * level
        break
      case 3:
        base = 500 * level
        break
      case 4:
        base = 800 * level
        break
      default:
        base = 0
    }
  }

  const b2bEligible = input.isB2BEligible
  let multiplier = 1
  if (b2bEligible && input.previousB2B) multiplier = 1.5

  let total = Math.floor(base * multiplier)

  // Combo: second consecutive clear onwards — 50 * comboTier * level
  if (input.comboTier >= 2) {
    total += 50 * (input.comboTier - 1) * level
  }

  total += input.softDropCells
  total += input.hardDropCells * 2

  const newB2B = b2bEligible

  return { score: total, newB2B }
}

export function getDropIntervalMs(level: number, settings: GameSettings): number {
  const { baseDropIntervalMs, levelSpeedFactor } = settings
  const factor = 1 + Math.max(0, level - 1) * levelSpeedFactor
  return Math.max(50, baseDropIntervalMs / factor)
}
