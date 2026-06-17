import type { BaseTowerKind, EvolvedTowerKind, TowerKind } from './types'

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
  /** number of enemies a shot pierces through (0 = single hit) */
  pierce: number
  emoji: string
  /** localization key suffix into towerDefenseGame.towers */
  i18nKey: TowerKind
  /** evolved towers cannot be built directly or evolved further */
  evolved: boolean
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
    pierce: 0,
    emoji: '🔵',
    i18nKey: 'pulse',
    evolved: false,
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
    pierce: 0,
    emoji: '🔴',
    i18nKey: 'splash',
    evolved: false,
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
    pierce: 0,
    emoji: '🟢',
    i18nKey: 'frost',
    evolved: false,
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
    pierce: 0,
    emoji: '🟣',
    i18nKey: 'beam',
    evolved: false,
  },
  // ---- evolved towers (built only via fusion) ----
  blizzard: {
    kind: 'blizzard',
    cost: 0,
    range: 140,
    damage: 28,
    fireRateMs: 850,
    splash: 64,
    slowMs: 1400,
    slowMul: 0.45,
    bulletSpeed: 360,
    pierce: 0,
    emoji: '❄️',
    i18nKey: 'blizzard',
    evolved: true,
  },
  railgun: {
    kind: 'railgun',
    cost: 0,
    range: 210,
    damage: 110,
    fireRateMs: 700,
    splash: 0,
    slowMs: 0,
    slowMul: 1,
    bulletSpeed: 1600,
    pierce: 4,
    emoji: '⚡',
    i18nKey: 'railgun',
    evolved: true,
  },
  tempest: {
    kind: 'tempest',
    cost: 0,
    range: 135,
    damage: 14,
    fireRateMs: 240,
    splash: 36,
    slowMs: 0,
    slowMul: 1,
    bulletSpeed: 560,
    pierce: 0,
    emoji: '🌪️',
    i18nKey: 'tempest',
    evolved: true,
  },
  prism: {
    kind: 'prism',
    cost: 0,
    range: 230,
    damage: 70,
    fireRateMs: 900,
    splash: 0,
    slowMs: 1000,
    slowMul: 0.55,
    bulletSpeed: 1500,
    pierce: 0,
    emoji: '🔮',
    i18nKey: 'prism',
    evolved: true,
  },
}

export const MAX_TOWER_LEVEL = 3

/** Upgrade cost for advancing a tower from `level` -> `level+1`. */
export function upgradeCost(kind: TowerKind, level: number): number {
  // Evolved towers have no base cost; price upgrades off a notional base.
  const base = TOWER_DEFS[kind].evolved ? 90 : TOWER_DEFS[kind].cost
  return Math.round(base * (0.8 + level * 0.7))
}

/** Total gold sunk into a tower at the given level (for sell refund). */
export function totalInvested(kind: TowerKind, level: number): number {
  let sum = TOWER_DEFS[kind].evolved ? 90 : TOWER_DEFS[kind].cost
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
    pierce: d.pierce,
  }
}

/** Only base towers appear in the build dock. */
export const TOWER_ORDER: BaseTowerKind[] = ['pulse', 'splash', 'frost', 'beam']

/**
 * Evolution recipes: two MAX-LEVEL base towers placed in orthogonally adjacent
 * cells fuse into an evolved tower. Keyed by sorted base-kind pair.
 */
const RECIPES: Record<string, EvolvedTowerKind> = {
  'frost|splash': 'blizzard',
  'beam|pulse': 'railgun',
  'pulse|splash': 'tempest',
  'beam|frost': 'prism',
}

function recipeKey(a: BaseTowerKind, b: BaseTowerKind): string {
  return [a, b].sort().join('|')
}

/** Returns the evolved kind for a pair of base kinds, or null if no recipe. */
export function evolutionFor(
  a: TowerKind,
  b: TowerKind,
): EvolvedTowerKind | null {
  if (TOWER_DEFS[a].evolved || TOWER_DEFS[b].evolved) return null
  return RECIPES[recipeKey(a as BaseTowerKind, b as BaseTowerKind)] ?? null
}
