import {
  BOSS_EVERY,
  EVOLVE_COST,
  GRID_COLS,
  GRID_ROWS,
  PATH_CELLS,
  START_GOLD,
  START_LIVES,
  TILE,
  UPGRADE_EVERY_WAVES,
  bountyScale,
  buildPathCellSet,
  buildWaypoints,
  cellCenter,
  enemyHpScale,
  enemySpeedScale,
  waveEnemyCount,
} from './constants'
import {
  MAX_TOWER_LEVEL,
  TOWER_DEFS,
  evolutionFor,
  recipesForBase,
  sellValue as defSellValue,
  towerStats,
  upgradeCost as defUpgradeCost,
} from './towers'
import type { Upgradable, Upgrade } from './upgrades'
import type {
  Beam,
  Cell,
  Enemy,
  EnemyKind,
  FloatText,
  GameStatus,
  Particle,
  Projectile,
  RunStats,
  Tower,
  TowerDefenseHudSnapshot,
  TowerKind,
  Vec,
  WaveEvent,
  WavePreview,
} from './types'

const SPAWN_INTERVAL_MS = 650
const FAST_SPAWN_INTERVAL_MS = 380

/** Mulberry32 — small deterministic PRNG seeded from a 32-bit int. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A pre-built wave: the spawn queue plus the event modifying it. */
interface PreparedWave {
  queue: EnemyKind[]
  event: WaveEvent
}

/** Options for constructing the engine (Feature 3 + 8). */
export interface EngineOptions {
  bestWave?: number
  pathCells?: Cell[]
  /** when set, wave/event generation is deterministic (daily challenge) */
  seed?: number | null
}

function emptyKillsByKind(): Record<TowerKind, number> {
  return {
    pulse: 0,
    splash: 0,
    frost: 0,
    beam: 0,
    blizzard: 0,
    railgun: 0,
    tempest: 0,
    prism: 0,
  }
}
const PALETTE_BEAM = '#c084fc'
const PALETTE_PRISM = '#e9d5ff'
const PALETTE_RAILGUN = '#fca5a5'

function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

/**
 * Fixed-path tower defense engine. Holds mutable entity arrays; `update(dt)`
 * advances the simulation. Rendering reads the public fields directly.
 */
export class TowerDefenseEngine implements Upgradable {
  enemies: Enemy[] = []
  towers: Tower[] = []
  projectiles: Projectile[] = []
  particles: Particle[] = []
  floats: FloatText[] = []
  beams: Beam[] = []

  /** optional SFX hook fired on notable events (set by the host) */
  onSfx: ((event: 'shoot' | 'hit' | 'place' | 'evolve' | 'wave' | 'over') => void) | null =
    null

  status: GameStatus = 'playing'
  gold = START_GOLD
  lives = START_LIVES
  wave = 0
  kills = 0
  bestWave = 0

  /** screen-shake intensity (px), decays each frame; read by the renderer */
  shake = 0

  /** full-screen white flash intensity (0..1), decays each frame; set on boss death */
  flash = 0

  /** render-only: position + timer for a localized "EVOLVED!" pop, decayed each frame */
  evolveFlash: { x: number; y: number; ms: number } | null = null

  // meta-upgrade modifiers (Upgradable)
  damageMul = 1
  rangeMul = 1
  rateMul = 1
  costMul = 1
  bonusBounty = 0
  interest = 0

  /** build selection state, driven by the hook/HUD */
  selected: TowerKind | null = null
  selectedTowerId: number | null = null

  /** active map's waypoints (world px) and path cell set (Feature 3) */
  readonly waypoints: Vec[]
  private pathCells: Set<string>
  private nextTowerId = 1
  private nextEnemyId = 1
  private taken: Record<string, number> = {}

  // wave spawn state
  private waveActive = false
  private toSpawn = 0
  private spawnTimer = 0
  private waveQueue: EnemyKind[] = []
  /** event applied to the currently-active wave (Feature 4) */
  activeEvent: WaveEvent = null

  /** lazily-generated upcoming wave (Feature 1) so the preview matches spawns */
  private nextWave: PreparedWave | null = null

  /** in-run aggregate stats (Feature 5) */
  stats: RunStats = {
    goldEarned: 0,
    goldSpent: 0,
    evolveCount: 0,
    killsByKind: emptyKillsByKind(),
  }

  /** RNG used for wave/event generation; deterministic for daily runs (Feature 8). */
  private rng: () => number

  constructor(opts: EngineOptions | number = {}) {
    const o: EngineOptions = typeof opts === 'number' ? { bestWave: opts } : opts
    this.bestWave = o.bestWave ?? 0
    const cells = o.pathCells ?? PATH_CELLS
    this.waypoints = buildWaypoints(cells)
    this.pathCells = buildPathCellSet(cells)
    this.rng = o.seed != null ? mulberry32(o.seed) : Math.random
  }

  /** Public read access for the renderer (Feature 3). */
  get pathCellSet(): Set<string> {
    return this.pathCells
  }

  get takenUpgrades(): Record<string, number> {
    return this.taken
  }

  /** Whether we're between waves and the next-wave button should be active. */
  get waveIdle(): boolean {
    return !this.waveActive && this.enemies.length === 0
  }

  private inspectedTower(): Tower | null {
    if (this.selectedTowerId == null) return null
    return this.towers.find((t) => t.id === this.selectedTowerId) ?? null
  }

  /**
   * If the inspected tower is a max-level base tower with a max-level
   * orthogonally-adjacent base tower forming a recipe, return the evolution
   * (the partner tower + resulting kind). Otherwise null.
   */
  private evolveInfo(): { partner: Tower; kind: TowerKind } | null {
    const t = this.inspectedTower()
    if (!t || t.level < MAX_TOWER_LEVEL || TOWER_DEFS[t.kind].evolved) return null
    const neighbours: Array<[number, number]> = [
      [t.col + 1, t.row],
      [t.col - 1, t.row],
      [t.col, t.row + 1],
      [t.col, t.row - 1],
    ]
    for (const [c, r] of neighbours) {
      const p = this.towers.find((x) => x.col === c && x.row === r)
      if (!p || p.level < MAX_TOWER_LEVEL || TOWER_DEFS[p.kind].evolved) continue
      const kind = evolutionFor(t.kind, p.kind)
      if (kind) return { partner: p, kind }
    }
    return null
  }

  getHud(): TowerDefenseHudSnapshot {
    const insp = this.inspectedTower()
    const canUpgrade =
      insp != null &&
      insp.level < MAX_TOWER_LEVEL &&
      this.gold >= this.upgradeCostFor(insp)
    const evo = this.evolveInfo()
    return {
      status: this.status,
      gold: Math.floor(this.gold),
      lives: this.lives,
      wave: this.wave,
      kills: this.kills,
      bestWave: this.bestWave,
      waveIdle: this.waveIdle,
      enemiesLeft: this.toSpawn + this.enemies.length,
      selected: this.selected,
      selectedTowerId: this.selectedTowerId,
      inspectLevel: insp?.level ?? 0,
      inspectKind: insp?.kind ?? null,
      upgradeCost: insp ? this.upgradeCostFor(insp) : 0,
      sellValue: insp ? defSellValue(insp.kind, insp.level) : 0,
      canUpgrade,
      canEvolve: evo != null && this.gold >= EVOLVE_COST,
      evolveKind: evo?.kind ?? null,
      evolveCost: EVOLVE_COST,
      nextWavePreview: this.waveIdle ? this.peekNextWave() : null,
      activeEvent: this.activeEvent,
      stats: this.stats,
      synergyHint: this.synergyHintFor(insp),
    }
  }

  /**
   * Feature 6: for an inspected base tower (any level), the first recipe it can
   * participate in — the evolved kind and the partner base kind required.
   */
  private synergyHintFor(
    insp: Tower | null,
  ): { evolveKind: TowerKind; partnerKind: TowerKind } | null {
    if (!insp || TOWER_DEFS[insp.kind].evolved) return null
    const recipes = recipesForBase(insp.kind)
    if (recipes.length === 0) return null
    const r = recipes[0]
    return { evolveKind: r.evolveKind, partnerKind: r.partner }
  }

  /**
   * Feature 1: composition of the upcoming wave (generated/stored lazily so the
   * preview is identical to what will actually spawn).
   */
  peekNextWave(): WavePreview {
    const w = this.ensureNextWave()
    const counts = { normal: 0, fast: 0, tank: 0, boss: 0 }
    for (const k of w.queue) counts[k] += 1
    return { ...counts, event: w.event }
  }

  private ensureNextWave(): PreparedWave {
    if (!this.nextWave) this.nextWave = this.buildPreparedWave(this.wave + 1)
    return this.nextWave
  }

  /**
   * Render hint: pairs of adjacent max-level base towers that form a valid
   * recipe (used to draw a pulsing link). Returns dedup'd tower-id pairs.
   */
  evolveLinks(): Array<{ a: Tower; b: Tower }> {
    const out: Array<{ a: Tower; b: Tower }> = []
    const seen = new Set<string>()
    for (const t of this.towers) {
      if (t.level < MAX_TOWER_LEVEL || TOWER_DEFS[t.kind].evolved) continue
      const neighbours: Array<[number, number]> = [
        [t.col + 1, t.row],
        [t.col, t.row + 1],
      ]
      for (const [c, r] of neighbours) {
        const p = this.towers.find((x) => x.col === c && x.row === r)
        if (!p || p.level < MAX_TOWER_LEVEL || TOWER_DEFS[p.kind].evolved) continue
        if (!evolutionFor(t.kind, p.kind)) continue
        const key = [t.id, p.id].sort().join('-')
        if (seen.has(key)) continue
        seen.add(key)
        out.push({ a: t, b: p })
      }
    }
    return out
  }

  private upgradeCostFor(t: Tower): number {
    return Math.round(defUpgradeCost(t.kind, t.level) * this.costMul)
  }

  private buildCostFor(kind: TowerKind): number {
    return Math.round(TOWER_DEFS[kind].cost * this.costMul)
  }

  applyUpgrade(u: Upgrade): void {
    u.apply(this)
    this.taken[u.id] = (this.taken[u.id] ?? 0) + 1
    if (this.status === 'upgrade') this.status = 'playing'
  }

  /** Select a build tower kind (clears tower inspection). */
  selectBuild(kind: TowerKind | null): void {
    this.selected = kind
    if (kind) this.selectedTowerId = null
  }

  /**
   * Handle a tap at world coordinates: select an existing tower, or place the
   * currently-selected build tower on an empty buildable cell.
   */
  handleTap(wx: number, wy: number): void {
    if (this.status !== 'playing') return
    const col = Math.floor(wx / TILE)
    const row = Math.floor(wy / TILE)
    if (col < 0 || row < 0 || col >= GRID_COLS || row >= GRID_ROWS) return

    const existing = this.towers.find((t) => t.col === col && t.row === row)
    if (existing) {
      this.selectedTowerId = existing.id
      this.selected = null
      return
    }

    if (this.selected) {
      this.tryPlace(this.selected, col, row)
    } else {
      this.selectedTowerId = null
    }
  }

  private tryPlace(kind: TowerKind, col: number, row: number): boolean {
    if (this.pathCells.has(`${col},${row}`)) return false
    if (this.towers.some((t) => t.col === col && t.row === row)) return false
    const cost = this.buildCostFor(kind)
    if (this.gold < cost) return false

    this.gold -= cost
    this.stats.goldSpent += cost
    const c = cellCenter(col, row)
    const s = towerStats(kind, 1)
    this.towers.push({
      id: this.nextTowerId++,
      kind,
      col,
      row,
      x: c.x,
      y: c.y,
      level: 1,
      range: s.range,
      damage: s.damage,
      fireRateMs: s.fireRateMs,
      cooldownMs: 0,
      aimAngle: 0,
      flashMs: 0,
    })
    // place ring effect
    this.spawnRing(c.x, c.y)
    this.onSfx?.('place')
    return true
  }

  /**
   * Fuse the inspected tower with its valid adjacent partner into the evolved
   * kind. Removes both base towers, places the evolved tower (level 1) on the
   * inspected cell, plays a big ring + burst + shake.
   */
  evolveSelected(): void {
    const t = this.inspectedTower()
    const evo = this.evolveInfo()
    if (!t || !evo || this.gold < EVOLVE_COST) return
    this.gold -= EVOLVE_COST
    this.stats.goldSpent += EVOLVE_COST
    this.stats.evolveCount += 1
    const col = t.col
    const row = t.row
    const partnerId = evo.partner.id
    // remove both base towers
    this.towers = this.towers.filter((x) => x.id !== t.id && x.id !== partnerId)
    const c = cellCenter(col, row)
    const s = towerStats(evo.kind, 1)
    const newTower: Tower = {
      id: this.nextTowerId++,
      kind: evo.kind,
      col,
      row,
      x: c.x,
      y: c.y,
      level: 1,
      range: s.range,
      damage: s.damage,
      fireRateMs: s.fireRateMs,
      cooldownMs: 0,
      aimAngle: 0,
      flashMs: 0,
    }
    this.towers.push(newTower)
    this.selectedTowerId = newTower.id
    // big effect
    this.spawnRing(c.x, c.y)
    this.spawnRing(c.x, c.y)
    this.spawnBurst(c.x, c.y, '#fde047', 28)
    this.spawnBurst(c.x, c.y, '#a5f3fc', 20)
    this.shake = Math.max(this.shake, 9)
    this.evolveFlash = { x: c.x, y: c.y - 24, ms: 900 }
    this.onSfx?.('evolve')
  }

  /** Upgrade the currently inspected tower if affordable. */
  upgradeSelected(): void {
    const t = this.inspectedTower()
    if (!t || t.level >= MAX_TOWER_LEVEL) return
    const cost = this.upgradeCostFor(t)
    if (this.gold < cost) return
    this.gold -= cost
    this.stats.goldSpent += cost
    t.level += 1
    const s = towerStats(t.kind, t.level)
    t.range = s.range
    t.damage = s.damage
    t.fireRateMs = s.fireRateMs
    this.spawnRing(t.x, t.y)
  }

  /** Sell the currently inspected tower for a partial refund. */
  sellSelected(): void {
    const t = this.inspectedTower()
    if (!t) return
    this.gold += defSellValue(t.kind, t.level)
    this.towers = this.towers.filter((x) => x.id !== t.id)
    this.selectedTowerId = null
    this.spawnBurst(t.x, t.y, '#fde047', 10)
  }

  /** Begin the next wave (only valid while idle). */
  startNextWave(): void {
    if (this.status !== 'playing' || !this.waveIdle) return
    this.wave += 1
    if (this.interest > 0) {
      this.gold += this.interest
      this.stats.goldEarned += this.interest
    }
    this.waveActive = true
    this.spawnTimer = 0
    const prepared = this.ensureNextWave()
    this.waveQueue = prepared.queue
    this.activeEvent = prepared.event
    this.nextWave = null // consume; the next preview regenerates for wave+1
    this.toSpawn = this.waveQueue.length
    if (this.wave % BOSS_EVERY === 0) this.shake = Math.max(this.shake, 10)
    this.onSfx?.('wave')
  }

  /**
   * Build the stored queue + event for a given wave deterministically against
   * `this.rng` (Feature 1 + 4 + 8). Called lazily; the result is cached so the
   * preview and the actual spawns are identical.
   */
  private buildPreparedWave(wave: number): PreparedWave {
    const isBoss = wave % BOSS_EVERY === 0
    // roll a special event on non-boss waves past a threshold
    let event: WaveEvent = null
    if (!isBoss && wave >= 4 && this.rng() < 0.28) {
      const roll = this.rng()
      event =
        roll < 0.25 ? 'rush' : roll < 0.5 ? 'armored' : roll < 0.75 ? 'swarm' : 'elite'
    }

    let count = waveEnemyCount(wave)
    if (event === 'swarm') count = Math.round(count * 3)
    else if (event === 'elite') count = Math.max(2, Math.round(count * 0.5))

    const queue: EnemyKind[] = []
    for (let i = 0; i < count; i++) {
      let kind: EnemyKind = 'normal'
      if (event === 'armored') {
        kind = this.rng() < 0.85 ? 'tank' : 'normal'
      } else {
        const r = this.rng()
        if (wave > 4 && r < 0.22) kind = 'tank'
        else if (r < 0.5) kind = 'fast'
      }
      queue.push(kind)
    }
    if (isBoss) queue.push('boss')
    return { queue, event }
  }

  /** Advance the simulation by dtMs (clamped to avoid tunnelling on refocus). */
  update(dtMs: number): void {
    if (this.status !== 'playing') return
    const dt = Math.min(dtMs, 50) / 1000 // seconds, clamped

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30)
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.2)
    if (this.evolveFlash) {
      this.evolveFlash.ms -= dt * 1000
      if (this.evolveFlash.ms <= 0) this.evolveFlash = null
    }

    this.spawnFromQueue(dt)
    this.moveEnemies(dt)
    this.updateTowers(dt)
    this.updateProjectiles(dt)
    this.updateParticles(dt)
    this.updateFloats(dt)
    this.updateBeams(dt)
    this.checkWaveCleared()
    this.checkDeath()
  }

  private spawnFromQueue(dt: number): void {
    if (!this.waveActive || this.toSpawn <= 0) return
    this.spawnTimer -= dt * 1000
    if (this.spawnTimer > 0) return
    const kind = this.waveQueue[this.waveQueue.length - this.toSpawn]
    this.spawnEnemy(kind)
    this.toSpawn -= 1
    this.spawnTimer = kind === 'fast' ? FAST_SPAWN_INTERVAL_MS : SPAWN_INTERVAL_MS
  }

  private spawnEnemy(kind: EnemyKind): void {
    const start = this.waypoints[0]
    let hpScale = enemyHpScale(this.wave)
    let spScale = enemySpeedScale(this.wave)
    const bScale = bountyScale(this.wave)
    // Feature 4 event modifiers (don't apply to bosses)
    if (kind !== 'boss') {
      if (this.activeEvent === 'rush') spScale *= 1.5
      else if (this.activeEvent === 'swarm') hpScale *= 0.5
      else if (this.activeEvent === 'elite') {
        hpScale *= 2
        spScale *= 2
      }
    }
    let base: Omit<
      Enemy,
      'id' | 'x' | 'y' | 'wpIndex' | 'slowMs' | 'slowMul' | 'hitFlashMs' | 'ageMs'
    >
    if (kind === 'fast') {
      base = {
        radius: 9,
        hp: 14 * hpScale,
        maxHp: 14 * hpScale,
        speed: 130 * spScale,
        kind,
        bounty: Math.round(4 * bScale),
      }
    } else if (kind === 'tank') {
      base = {
        radius: 16,
        hp: 90 * hpScale,
        maxHp: 90 * hpScale,
        speed: 42 * spScale,
        kind,
        bounty: Math.round(10 * bScale),
      }
    } else if (kind === 'boss') {
      base = {
        radius: 24,
        hp: 800 * hpScale,
        maxHp: 800 * hpScale,
        speed: 36 * spScale,
        kind,
        bounty: Math.round(120 * bScale),
      }
    } else {
      base = {
        radius: 12,
        hp: 32 * hpScale,
        maxHp: 32 * hpScale,
        speed: 64 * spScale,
        kind,
        bounty: Math.round(6 * bScale),
      }
    }
    this.enemies.push({
      ...base,
      id: this.nextEnemyId++,
      x: start.x,
      y: start.y,
      wpIndex: 1,
      slowMs: 0,
      slowMul: 1,
      hitFlashMs: 0,
      ageMs: 0,
    })
  }

  private moveEnemies(dt: number): void {
    const survivors: Enemy[] = []
    for (const e of this.enemies) {
      e.ageMs += dt * 1000
      if (e.hitFlashMs > 0) e.hitFlashMs -= dt * 1000
      if (e.slowMs > 0) {
        e.slowMs -= dt * 1000
        if (e.slowMs <= 0) e.slowMul = 1
      }
      const target = this.waypoints[e.wpIndex]
      if (!target) {
        // reached the exit
        this.lives -= e.kind === 'boss' ? 5 : 1
        this.shake = Math.max(this.shake, e.kind === 'boss' ? 12 : 5)
        continue
      }
      const dx = target.x - e.x
      const dy = target.y - e.y
      const d = Math.hypot(dx, dy)
      const step = e.speed * (e.slowMs > 0 ? e.slowMul : 1) * dt
      if (d <= step) {
        e.x = target.x
        e.y = target.y
        e.wpIndex += 1
      } else {
        e.x += (dx / d) * step
        e.y += (dy / d) * step
      }
      survivors.push(e)
    }
    this.enemies = survivors
  }

  private updateTowers(dt: number): void {
    for (const t of this.towers) {
      if (t.cooldownMs > 0) t.cooldownMs -= dt * 1000
      if (t.flashMs > 0) t.flashMs -= dt * 1000
      if (t.cooldownMs > 0) continue
      const target = this.acquireTarget(t)
      if (!target) continue
      t.aimAngle = Math.atan2(target.y - t.y, target.x - t.x)
      t.cooldownMs = t.fireRateMs * this.rateMul
      t.flashMs = 90
      this.fire(t, target)
      this.onSfx?.('shoot')
    }
  }

  /** Pick the enemy furthest along the path within range (classic "first"). */
  private acquireTarget(t: Tower): Enemy | null {
    let best: Enemy | null = null
    let bestProgress = -1
    const r2 = (t.range * this.rangeMul) ** 2
    for (const e of this.enemies) {
      if (dist2(e.x, e.y, t.x, t.y) > r2) continue
      if (e.wpIndex > bestProgress) {
        bestProgress = e.wpIndex
        best = e
      }
    }
    return best
  }

  private fire(t: Tower, target: Enemy): void {
    const s = towerStats(t.kind, t.level)
    const dmg = t.damage * this.damageMul
    const ang = Math.atan2(target.y - t.y, target.x - t.x)

    // Beam-type towers fire an instantaneous hitscan line + transient visual.
    if (t.kind === 'beam' || t.kind === 'prism') {
      this.damageEnemy(target, dmg, t.kind)
      if (s.slowMs > 0) {
        target.slowMs = s.slowMs
        target.slowMul = s.slowMul
      }
      this.beams.push({
        x1: t.x,
        y1: t.y,
        x2: target.x,
        y2: target.y,
        lifeMs: 140,
        maxLifeMs: 140,
        color: t.kind === 'prism' ? PALETTE_PRISM : PALETTE_BEAM,
        width: t.kind === 'prism' ? 3 : 2,
      })
      this.spawnBurst(target.x, target.y, t.kind === 'prism' ? '#e9d5ff' : '#c084fc', 6)
      return
    }

    this.projectiles.push({
      x: t.x,
      y: t.y,
      px: t.x,
      py: t.y,
      vx: Math.cos(ang) * s.bulletSpeed,
      vy: Math.sin(ang) * s.bulletSpeed,
      radius: t.kind === 'splash' || t.kind === 'blizzard' ? 6 : 4,
      damage: dmg,
      kind: t.kind,
      sourceKind: t.kind,
      lifeMs: 1600,
      splash: s.splash,
      slowMs: s.slowMs,
      slowMul: s.slowMul,
      pierce: s.pierce,
      hitIds: [],
    })
  }

  private updateProjectiles(dt: number): void {
    const next: Projectile[] = []
    for (const pr of this.projectiles) {
      pr.px = pr.x
      pr.py = pr.y
      pr.x += pr.vx * dt
      pr.y += pr.vy * dt
      pr.lifeMs -= dt * 1000
      if (
        pr.lifeMs <= 0 ||
        pr.x < -20 ||
        pr.y < -20 ||
        pr.x > GRID_COLS * TILE + 20 ||
        pr.y > GRID_ROWS * TILE + 20
      ) {
        continue
      }
      let consumed = false
      for (const e of this.enemies) {
        if (pr.hitIds.length > 0 && pr.hitIds.includes(e.id)) continue
        const rr = pr.radius + e.radius
        if (dist2(pr.x, pr.y, e.x, e.y) <= rr * rr) {
          const stop = this.onProjectileHit(pr, e)
          if (stop) {
            consumed = true
            break
          }
        }
      }
      if (!consumed) next.push(pr)
    }
    this.projectiles = next
  }

  /** Returns true if the projectile should be destroyed (no more piercing). */
  private onProjectileHit(pr: Projectile, e: Enemy): boolean {
    if (pr.splash > 0) {
      // AoE: damage everyone in radius
      const r2 = pr.splash * pr.splash
      for (const other of this.enemies) {
        if (dist2(pr.x, pr.y, other.x, other.y) <= r2) {
          this.damageEnemy(other, pr.damage, pr.sourceKind)
          if (pr.slowMs > 0) {
            other.slowMs = pr.slowMs
            other.slowMul = pr.slowMul
          }
        }
      }
      const aoeCyan = pr.kind === 'blizzard'
      this.spawnBurst(pr.x, pr.y, aoeCyan ? '#7dd3fc' : '#f87171', 14)
      if (aoeCyan) this.spawnShards(pr.x, pr.y, '#bae6fd', 8)
      // visible expanding ring for the blast
      this.spawnRing(pr.x, pr.y)
      this.shake = Math.max(this.shake, 2)
      return true
    }
    // single / piercing target
    this.damageEnemy(e, pr.damage, pr.sourceKind)
    if (pr.slowMs > 0) {
      e.slowMs = pr.slowMs
      e.slowMul = pr.slowMul
      // frost/prism slow application: cyan crystal burst
      this.spawnShards(pr.x, pr.y, '#a5f3fc', 5)
    }
    this.onSfx?.('hit')
    if (pr.pierce > 0) {
      pr.hitIds.push(e.id)
      this.spawnBurst(pr.x, pr.y, PALETTE_RAILGUN, 4)
      pr.pierce -= 1
      return pr.pierce < 0 ? true : false
    }
    this.spawnBurst(pr.x, pr.y, pr.kind === 'beam' ? '#c084fc' : '#bae6fd', 6)
    return true
  }

  private updateBeams(dt: number): void {
    if (this.beams.length === 0) return
    for (const b of this.beams) b.lifeMs -= dt * 1000
    this.beams = this.beams.filter((b) => b.lifeMs > 0)
  }

  private damageEnemy(e: Enemy, dmg: number, sourceKind?: TowerKind): void {
    if (e.hp <= 0) return
    e.hp -= dmg
    e.hitFlashMs = 90
    this.floats.push({
      x: e.x,
      y: e.y - e.radius - 4,
      text: String(Math.round(dmg)),
      lifeMs: 520,
      color: '#ffffff',
    })
    if (e.hp <= 0) this.killEnemy(e, sourceKind)
  }

  private killEnemy(e: Enemy, sourceKind?: TowerKind): void {
    const idx = this.enemies.indexOf(e)
    if (idx === -1) return
    this.enemies.splice(idx, 1)
    this.kills += 1
    if (sourceKind) this.stats.killsByKind[sourceKind] += 1
    const bounty = e.bounty + this.bonusBounty
    this.gold += bounty
    this.stats.goldEarned += bounty
    this.floats.push({
      x: e.x,
      y: e.y - e.radius - 14,
      text: `+${bounty}`,
      lifeMs: 700,
      color: '#fde047',
    })
    if (e.kind === 'tank') {
      // spinning metal shards
      this.spawnShards(e.x, e.y, '#9aa48a', 10)
      this.spawnShards(e.x, e.y, '#5a614a', 6)
      this.spawnBurst(e.x, e.y, '#3a3f30', 6)
    } else if (e.kind === 'boss') {
      this.spawnBurst(e.x, e.y, this.enemyColor(e.kind), 32)
      this.spawnShards(e.x, e.y, '#fecdd3', 14)
      this.spawnBurst(e.x, e.y, '#ffffff', 18)
      this.flash = 1
      this.shake = Math.max(this.shake, 12)
    } else {
      this.spawnBurst(e.x, e.y, this.enemyColor(e.kind), 10)
    }
  }

  private enemyColor(kind: EnemyKind): string {
    if (kind === 'fast') return '#fbbf24'
    if (kind === 'tank') return '#94a3b8'
    if (kind === 'boss') return '#fb7185'
    return '#a3e635'
  }

  private spawnBurst(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 40 + Math.random() * 120
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        lifeMs: 320 + Math.random() * 240,
        maxLifeMs: 560,
        size: 2 + Math.floor(Math.random() * 3),
        color,
      })
    }
  }

  /** Rotating rectangular shard particles (metal debris, ice crystals). */
  private spawnShards(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 50 + Math.random() * 150
      const w = 2 + Math.random() * 4
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        lifeMs: 360 + Math.random() * 320,
        maxLifeMs: 680,
        size: 0,
        color,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 16,
        w,
        h: w * (0.4 + Math.random() * 0.5),
      })
    }
  }

  private spawnRing(x: number, y: number): void {
    this.floats.push({ x, y, text: '', lifeMs: 360, color: 'ring' })
  }

  private updateParticles(dt: number): void {
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.92
      p.vy *= 0.92
      if (p.spin != null) p.rot = (p.rot ?? 0) + p.spin * dt
      p.lifeMs -= dt * 1000
    }
    this.particles = this.particles.filter((p) => p.lifeMs > 0)
  }

  private updateFloats(dt: number): void {
    for (const f of this.floats) {
      if (f.color !== 'ring') f.y -= dt * 26
      f.lifeMs -= dt * 1000
    }
    this.floats = this.floats.filter((f) => f.lifeMs > 0)
  }

  private checkWaveCleared(): void {
    if (this.waveActive && this.toSpawn <= 0 && this.enemies.length === 0) {
      this.waveActive = false
      if (this.wave > this.bestWave) this.bestWave = this.wave
      if (this.wave > 0 && this.wave % UPGRADE_EVERY_WAVES === 0) {
        this.status = 'upgrade'
      }
    }
  }

  private checkDeath(): void {
    if (this.lives <= 0) {
      this.lives = 0
      this.status = 'gameover'
      this.onSfx?.('over')
      if (this.wave > this.bestWave) this.bestWave = this.wave
    }
  }
}
