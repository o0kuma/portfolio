import type { TowerKind } from './types'

/** Per-tower base definition. Level scaling is applied multiplicatively. */
export interface TowerDef {
  kind: TowerKind
  cost: number
  range: number
  damage: number
  fireRateMs: number
  /** splash radius for AoE towers (0 = single target) */
  splash: number
  /** slow effect applied on hit */
  slowMs: number
  slowMul: number
  /** projectile travel speed in px/s (beam is near-instant via high speed) */
  bulletSpeed: number
  emoji: string
  /** localization key suffix into towerDefenseGame.towers */
  i18nKey: 'pulse' | 'splash' | 'frost' | 'beam'
}

export const TOWER_DEFS: Record<TowerKind, TowerDef> = {
  pulse: {
    kind: 'pulse',
    cost: 40,
    range: 110,
    damage: 9,
    fireRateMs: 360,
    splash: 0,
    slowMs: 0,
    slowMul: 1,
    bulletSpeed: 520,
    emoji: '🔵',
    i18nKey: 'pulse',
  },
  splash: {
    kind: 'splash',
    cost: 75,
    range: 120,
    damage: 16,
    fireRateMs: 1000,
    splash: 46,
    slowMs: 0,
    slowMul: 1,
    bulletSpeed: 320,
    emoji: '🔴',
    i18nKey: 'splash',
  },
  frost: {
    kind: 'frost',
    cost: 60,
    range: 115,
    damage: 5,
    fireRateMs: 600,
    splash: 0,
    slowMs: 1200,
    slowMul: 0.5,
    bulletSpeed: 420,
    emoji: '🟢',
    i18nKey: 'frost',
  },
  beam: {
    kind: 'beam',
    cost: 120,
    range: 180,
    damage: 60,
    fireRateMs: 1400,
    splash: 0,
    slowMs: 0,
    slowMul: 1,
    bulletSpeed: 1200,
    emoji: '🟣',
    i18nKey: 'beam',
  },
}

export const MAX_TOWER_LEVEL = 3

/** Upgrade cost for advancing a tower from `level` -> `level+1`. */
export function upgradeCost(kind: TowerKind, level: number): number {
  return Math.round(TOWER_DEFS[kind].cost * (0.8 + level * 0.7))
}

/** Total gold sunk into a tower at the given level (for sell refund). */
export function totalInvested(kind: TowerKind, level: number): number {
  let sum = TOWER_DEFS[kind].cost
  for (let l = 1; l < level; l++) sum += upgradeCost(kind, l)
  return sum
}

/** Refund value when selling (70% of invested). */
export function sellValue(kind: TowerKind, level: number): number {
  return Math.floor(totalInvested(kind, level) * 0.7)
}

/** Derived stats at a level. Each level: +35% damage, +12% range, +10% rate. */
export function towerStats(kind: TowerKind, level: number) {
  const d = TOWER_DEFS[kind]
  const dmgMul = 1 + (level - 1) * 0.35
  const rangeMul = 1 + (level - 1) * 0.12
  const rateMul = Math.pow(0.9, level - 1)
  return {
    range: d.range * rangeMul,
    damage: d.damage * dmgMul,
    fireRateMs: d.fireRateMs * rateMul,
    splash: d.splash,
    slowMs: d.slowMs,
    slowMul: d.slowMul,
    bulletSpeed: d.bulletSpeed,
  }
}

export const TOWER_ORDER: TowerKind[] = ['pulse', 'splash', 'frost', 'beam']
