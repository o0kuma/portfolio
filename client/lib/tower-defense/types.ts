export type BaseTowerKind = 'pulse' | 'splash' | 'frost' | 'beam' | 'sniper' | 'support'
export type EvolvedTowerKind = 'blizzard' | 'railgun' | 'tempest' | 'prism' | 'omega' | 'fortress'
export type TowerKind = BaseTowerKind | EvolvedTowerKind

export type EnemyKind = 'normal' | 'fast' | 'tank' | 'boss' | 'ghost' | 'regen'

/** Special wave events that modify a wave's composition/stats (Feature 4). */
export type WaveEvent = 'rush' | 'armored' | 'swarm' | 'elite' | null

/** Per-kind composition counts of an upcoming wave (preview / Feature 1). */
export interface WavePreview {
  normal: number
  fast: number
  tank: number
  boss: number
  ghost: number
  regen: number
  event: WaveEvent
}

/** In-run aggregate stats (Feature 5). */
export interface RunStats {
  goldEarned: number
  goldSpent: number
  evolveCount: number
  killsByKind: Record<TowerKind, number>
}

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
  /** render-only: age since spawn (ms), drives scale-in & tread animation */
  ageMs: number
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
  /** kind of the tower that fired this (for kill attribution) */
  sourceKind: TowerKind
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
  /** optional: current rotation (rad) for spinning rect shards */
  rot?: number
  /** optional: angular velocity (rad/s) */
  spin?: number
  /** optional: rect width (px); when set with h, draws a rotated rect */
  w?: number
  /** optional: rect height (px) */
  h?: number
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
  /** composition of the upcoming wave shown between waves (Feature 1) */
  nextWavePreview: WavePreview | null
  /** the currently-active wave's special event, if any (Feature 4) */
  activeEvent: WaveEvent
  /** in-run aggregate stats (Feature 5) */
  stats: RunStats
  /**
   * Synergy/recipe hint for the inspected base tower (Feature 6): the evolved
   * kind it could become and the neighbor kind required. Null when none / evolved.
   */
  synergyHint: { evolveKind: TowerKind; partnerKind: TowerKind } | null
}
