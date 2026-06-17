export type BaseTowerKind = 'pulse' | 'splash' | 'frost' | 'beam'
export type EvolvedTowerKind = 'blizzard' | 'railgun' | 'tempest' | 'prism'
export type TowerKind = BaseTowerKind | EvolvedTowerKind

export type EnemyKind = 'normal' | 'fast' | 'tank' | 'boss'

export interface Vec {
  x: number
  y: number
}

/** A grid cell coordinate (column/row). */
export interface Cell {
  col: number
  row: number
}

export interface Enemy {
  id: number
  x: number
  y: number
  radius: number
  hp: number
  maxHp: number
  /** base movement speed in px/s before slow modifiers */
  speed: number
  kind: EnemyKind
  /** index of the next waypoint the enemy is walking toward */
  wpIndex: number
  /** remaining slow effect: speed *= slowMul while slowMs > 0 */
  slowMs: number
  slowMul: number
  /** gold granted on kill */
  bounty: number
  /** render-only: white hit-flash timer (ms), set on damage */
  hitFlashMs: number
}

export interface Tower {
  id: number
  kind: TowerKind
  col: number
  row: number
  x: number
  y: number
  level: number
  /** current derived stats (recomputed on upgrade) */
  range: number
  damage: number
  fireRateMs: number
  /** ms until this tower can fire again */
  cooldownMs: number
  /** render-only: last firing angle */
  aimAngle: number
  /** render-only: muzzle flash timer */
  flashMs: number
}

export interface Projectile {
  x: number
  y: number
  /** previous-frame position, for motion trails */
  px: number
  py: number
  vx: number
  vy: number
  radius: number
  damage: number
  kind: TowerKind
  lifeMs: number
  /** splash radius (0 = single target) */
  splash: number
  /** slow effect applied on hit */
  slowMs: number
  slowMul: number
  /** remaining number of enemies this projectile can pierce through (0 = stop on first hit) */
  pierce: number
  /** ids of enemies already hit (pierce tracking) */
  hitIds: number[]
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  lifeMs: number
  maxLifeMs: number
  size: number
  color: string
}

/** A short-lived instantaneous beam/streak visual (railgun, prism). */
export interface Beam {
  x1: number
  y1: number
  x2: number
  y2: number
  lifeMs: number
  maxLifeMs: number
  color: string
  width: number
}

export interface FloatText {
  x: number
  y: number
  text: string
  lifeMs: number
  color: string
}

export type GameStatus = 'ready' | 'playing' | 'paused' | 'upgrade' | 'gameover'

/** Lightweight snapshot pushed to React for the HUD. */
export interface TowerDefenseHudSnapshot {
  status: GameStatus
  gold: number
  lives: number
  wave: number
  kills: number
  bestWave: number
  /** true between waves (next-wave button is actionable) */
  waveIdle: boolean
  /** enemies remaining in the active wave (spawned + alive) */
  enemiesLeft: number
  /** currently selected build tower kind (null = none) */
  selected: TowerKind | null
  /** id of the currently inspected placed tower (null = none) */
  selectedTowerId: number | null
  /** stats of the inspected tower for the upgrade/sell panel */
  inspectLevel: number
  inspectKind: TowerKind | null
  upgradeCost: number
  sellValue: number
  canUpgrade: boolean
  /** true when the inspected tower can be evolved with an adjacent tower */
  canEvolve: boolean
  /** the evolved kind the inspected tower would become (null = none) */
  evolveKind: TowerKind | null
  /** gold cost to evolve */
  evolveCost: number
}
