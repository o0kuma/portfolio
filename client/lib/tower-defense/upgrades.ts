/** Meta-upgrade pool offered every few cleared waves (mirror of Survive). */

/** The subset of engine fields meta-upgrades may read/modify. */
export interface Upgradable {
  /** global multiplier applied to every tower's damage */
  damageMul: number
  /** global multiplier applied to every tower's range */
  rangeMul: number
  /** global multiplier applied to every tower's fire rate (lower = faster) */
  rateMul: number
  /** multiplier on tower build & upgrade gold costs */
  costMul: number
  /** flat bonus gold per kill */
  bonusBounty: number
  /** gold granted at the start of each wave (interest) */
  interest: number
}

export interface Upgrade {
  id: string
  /** localization key suffix into towerDefenseGame.upgrades.<id> */
  i18nKey: string
  /** Max times this upgrade can be picked. */
  maxStacks: number
  /** Whether it can currently appear. */
  available: (e: Upgradable, taken: Record<string, number>) => boolean
  apply: (e: Upgradable) => void
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'damage',
    i18nKey: 'damage',
    maxStacks: 8,
    available: () => true,
    apply: (e) => {
      e.damageMul = +(e.damageMul + 0.1).toFixed(3)
    },
  },
  {
    id: 'range',
    i18nKey: 'range',
    maxStacks: 5,
    available: () => true,
    apply: (e) => {
      e.rangeMul = +(e.rangeMul + 0.08).toFixed(3)
    },
  },
  {
    id: 'firerate',
    i18nKey: 'firerate',
    maxStacks: 6,
    available: (e) => e.rateMul > 0.55,
    apply: (e) => {
      e.rateMul = +Math.max(0.55, e.rateMul * 0.9).toFixed(3)
    },
  },
  {
    id: 'cheaper',
    i18nKey: 'cheaper',
    maxStacks: 4,
    available: (e) => e.costMul > 0.6,
    apply: (e) => {
      e.costMul = +Math.max(0.6, e.costMul - 0.08).toFixed(3)
    },
  },
  {
    id: 'bounty',
    i18nKey: 'bounty',
    maxStacks: 8,
    available: () => true,
    apply: (e) => {
      e.bonusBounty += 2
    },
  },
  {
    id: 'interest',
    i18nKey: 'interest',
    maxStacks: 6,
    available: () => true,
    apply: (e) => {
      e.interest += 15
    },
  },
]

/** Pick up to `count` distinct, currently-available upgrades that haven't hit max stacks. */
export function rollUpgrades(
  e: Upgradable,
  taken: Record<string, number>,
  count = 3,
): Upgrade[] {
  const pool = UPGRADES.filter(
    (u) => (taken[u.id] ?? 0) < u.maxStacks && u.available(e, taken),
  )
  // Fisher–Yates partial shuffle
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}
