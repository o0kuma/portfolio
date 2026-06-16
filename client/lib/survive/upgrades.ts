/** Upgrade pool offered on level-up. Each upgrade mutates the engine's stat fields. */

/** The subset of engine fields upgrades may read/modify. */
export interface Upgradable {
  player: { maxHp: number; hp: number; speed: number; pickupRange: number }
  // bullet weapon
  bulletDamage: number
  bulletCount: number
  bulletCooldownMs: number
  bulletPierce: number
  // orb weapon
  orbCount: number
  orbDamage: number
  orbOrbitRadius: number
  // blast weapon
  blastDamage: number
  blastRadius: number
  blastCooldownMs: number
}

export interface Upgrade {
  id: string
  name: string
  desc: string
  /** Max times this upgrade can be picked. */
  maxStacks: number
  /** Whether it can currently appear (e.g. weapon unlocks). */
  available: (e: Upgradable, taken: Record<string, number>) => boolean
  apply: (e: Upgradable) => void
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'bullet_dmg',
    name: '예리한 탄환',
    desc: '기본 탄환 데미지 +5',
    maxStacks: 8,
    available: () => true,
    apply: (e) => {
      e.bulletDamage += 5
    },
  },
  {
    id: 'bullet_count',
    name: '다연발',
    desc: '탄환을 한 발 더 발사',
    maxStacks: 5,
    available: () => true,
    apply: (e) => {
      e.bulletCount += 1
    },
  },
  {
    id: 'bullet_rate',
    name: '속사',
    desc: '탄환 발사 속도 +18%',
    maxStacks: 6,
    available: (e) => e.bulletCooldownMs > 120,
    apply: (e) => {
      e.bulletCooldownMs = Math.max(120, Math.round(e.bulletCooldownMs * 0.82))
    },
  },
  {
    id: 'bullet_pierce',
    name: '관통',
    desc: '탄환이 적을 하나 더 관통',
    maxStacks: 4,
    available: () => true,
    apply: (e) => {
      e.bulletPierce += 1
    },
  },
  {
    id: 'orb_unlock',
    name: '회전 오브',
    desc: '주변을 도는 오브 획득 (신규 무기)',
    maxStacks: 1,
    available: (e) => e.orbCount === 0,
    apply: (e) => {
      e.orbCount = 2
      e.orbDamage = 8
    },
  },
  {
    id: 'orb_count',
    name: '오브 증가',
    desc: '회전 오브 +1',
    maxStacks: 5,
    available: (e) => e.orbCount > 0,
    apply: (e) => {
      e.orbCount += 1
    },
  },
  {
    id: 'orb_dmg',
    name: '오브 강화',
    desc: '오브 데미지 +6',
    maxStacks: 6,
    available: (e) => e.orbCount > 0,
    apply: (e) => {
      e.orbDamage += 6
    },
  },
  {
    id: 'blast_unlock',
    name: '충격파',
    desc: '주기적으로 주변을 폭발 (신규 무기)',
    maxStacks: 1,
    available: (e) => e.blastDamage === 0,
    apply: (e) => {
      e.blastDamage = 14
      e.blastRadius = 110
      e.blastCooldownMs = 1600
    },
  },
  {
    id: 'blast_dmg',
    name: '폭발 강화',
    desc: '충격파 데미지 +10',
    maxStacks: 6,
    available: (e) => e.blastDamage > 0,
    apply: (e) => {
      e.blastDamage += 10
    },
  },
  {
    id: 'blast_radius',
    name: '폭발 범위',
    desc: '충격파 범위 +25%',
    maxStacks: 5,
    available: (e) => e.blastDamage > 0,
    apply: (e) => {
      e.blastRadius = Math.round(e.blastRadius * 1.25)
    },
  },
  {
    id: 'max_hp',
    name: '강인함',
    desc: '최대 체력 +25 (즉시 회복)',
    maxStacks: 8,
    available: () => true,
    apply: (e) => {
      e.player.maxHp += 25
      e.player.hp = Math.min(e.player.maxHp, e.player.hp + 25)
    },
  },
  {
    id: 'heal',
    name: '응급 치료',
    desc: '체력 40 회복',
    maxStacks: 99,
    available: (e) => e.player.hp < e.player.maxHp,
    apply: (e) => {
      e.player.hp = Math.min(e.player.maxHp, e.player.hp + 40)
    },
  },
  {
    id: 'speed',
    name: '신속',
    desc: '이동 속도 +12%',
    maxStacks: 5,
    available: () => true,
    apply: (e) => {
      e.player.speed = Math.round(e.player.speed * 1.12)
    },
  },
  {
    id: 'pickup',
    name: '자력',
    desc: '경험치 수집 범위 +35%',
    maxStacks: 5,
    available: () => true,
    apply: (e) => {
      e.player.pickupRange = Math.round(e.player.pickupRange * 1.35)
    },
  },
]

/** Pick up to `count` distinct, currently-available upgrades that haven't hit max stacks. */
export function rollUpgrades(
  e: Upgradable,
  taken: Record<string, number>,
  count = 3
): Upgrade[] {
  const pool = UPGRADES.filter(
    (u) => (taken[u.id] ?? 0) < u.maxStacks && u.available(e, taken)
  )
  // Fisher–Yates partial shuffle
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}
