export type EnemyKind = 'slime' | 'fast' | 'tank'

export interface Vec {
  x: number
  y: number
}

export interface Player {
  x: number
  y: number
  hp: number
  maxHp: number
  speed: number
  level: number
  xp: number
  xpToNext: number
  invulnMs: number
  pickupRange: number
  /** facing angle (rad) for sprite/orientation */
  facing: number
}

export interface Enemy {
  x: number
  y: number
  radius: number
  hp: number
  maxHp: number
  speed: number
  damage: number
  kind: EnemyKind
  /** per-orb / per-blast hit cooldown to avoid every-frame multi-hits, keyed by source */
  hitCooldownMs: number
}

export interface Projectile {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  damage: number
  pierce: number
  lifeMs: number
}

export interface Gem {
  x: number
  y: number
  value: number
}

export interface FloatText {
  x: number
  y: number
  text: string
  lifeMs: number
  color: string
}

/** Per-weapon leveled stats. level 0 = not yet owned. */
export interface WeaponStats {
  bulletLevel: number
  orbLevel: number
  blastLevel: number
}

export type GameStatus = 'ready' | 'playing' | 'paused' | 'levelup' | 'gameover'

/** Lightweight snapshot pushed to React for the HUD. */
export interface SurviveHudSnapshot {
  status: GameStatus
  hp: number
  maxHp: number
  level: number
  xp: number
  xpToNext: number
  timeSec: number
  kills: number
  bestTimeSec: number
}
