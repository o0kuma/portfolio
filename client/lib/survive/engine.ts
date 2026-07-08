import {
  BASE_PICKUP_RANGE,
  PLAYER_BASE_SPEED,
  PLAYER_INVULN_MS,
  PLAYER_MAX_HP,
  PLAYER_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  enemyHpScale,
  spawnBatch,
  spawnIntervalMs,
  xpForLevel,
} from './constants'
import type { Upgradable, Upgrade } from './upgrades'
import type {
  Enemy,
  EnemyKind,
  FloatText,
  GameStatus,
  Gem,
  Player,
  Projectile,
  SurviveHudSnapshot,
  Vec,
} from './types'

const ORB_HIT_COOLDOWN_MS = 220
const BLAST_HIT_COOLDOWN_MS = 240

/** Boss spawns every BOSS_INTERVAL_SEC seconds (first at 2 min). */
const BOSS_INTERVAL_SEC = 120
/** Duration of the "BOSS WAVE" announcement overlay in ms. */
const BOSS_ANNOUNCE_MS = 2000

function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/**
 * Real-time survivor engine. Holds mutable entity arrays; `update(dt)` advances the
 * simulation. Rendering reads the public fields directly (see SurviveCanvas).
 */
export class SurviveEngine implements Upgradable {
  player: Player
  enemies: Enemy[] = []
  projectiles: Projectile[] = []
  gems: Gem[] = []
  floats: FloatText[] = []

  status: GameStatus = 'playing'
  elapsedMs = 0
  kills = 0
  bestTimeSec = 0

  // bullet weapon
  bulletDamage = 10
  bulletCount = 1
  bulletCooldownMs = 520
  bulletPierce = 0
  // orb weapon (0 = not owned)
  orbCount = 0
  orbDamage = 0
  orbOrbitRadius = 60
  // blast weapon (0 dmg = not owned)
  blastDamage = 0
  blastRadius = 0
  blastCooldownMs = 1600

  /** Remaining ms of the boss announcement overlay (0 = not showing). */
  bossAnnounceMs = 0

  /** input movement direction (already normalized), set by the hook each frame */
  private moveDir: Vec = { x: 0, y: 0 }

  private bulletTimer = 0
  private blastTimer = 0
  private spawnTimer = 0
  private orbAngle = 0
  private taken: Record<string, number> = {}
  /** The next second at which a boss should be announced (then spawned after announce). */
  private nextBossSec = BOSS_INTERVAL_SEC
  /** When > 0, spawn the boss once the announcement finishes. */
  private bossSpawnPending = false

  constructor(bestTimeSec = 0) {
    this.bestTimeSec = bestTimeSec
    this.player = this.freshPlayer()
  }

  private freshPlayer(): Player {
    return {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      speed: PLAYER_BASE_SPEED,
      level: 1,
      xp: 0,
      xpToNext: xpForLevel(1),
      invulnMs: 0,
      pickupRange: BASE_PICKUP_RANGE,
      facing: 0,
    }
  }

  get timeSec(): number {
    return Math.floor(this.elapsedMs / 1000)
  }

  get takenUpgrades(): Record<string, number> {
    return this.taken
  }

  /** Current orbit angle, for the renderer. */
  get orbRenderAngle(): number {
    return this.orbAngle
  }

  setMoveInput(dir: Vec): void {
    this.moveDir = dir
  }

  getHud(): SurviveHudSnapshot {
    const boss = this.enemies.find((e) => e.isBoss)
    return {
      status: this.status,
      hp: Math.max(0, Math.ceil(this.player.hp)),
      maxHp: this.player.maxHp,
      level: this.player.level,
      xp: this.player.xp,
      xpToNext: this.player.xpToNext,
      timeSec: this.timeSec,
      kills: this.kills,
      bestTimeSec: this.bestTimeSec,
      bossHp: boss ? Math.max(0, Math.ceil(boss.hp)) : 0,
      bossMaxHp: boss ? boss.maxHp : 0,
      bossAnnounceMs: this.bossAnnounceMs,
    }
  }

  applyUpgrade(u: Upgrade): void {
    u.apply(this)
    this.taken[u.id] = (this.taken[u.id] ?? 0) + 1
    if (this.status === 'levelup' || this.status === 'bossupgrade') this.status = 'playing'
  }

  /** Advance the simulation by dtMs (clamped to avoid tunnelling on tab refocus). */
  update(dtMs: number): void {
    if (this.status !== 'playing') return
    const dt = Math.min(dtMs, 50) / 1000 // seconds, clamped
    this.elapsedMs += dt * 1000

    this.movePlayer(dt)
    this.checkBossWave(dt)
    this.spawnEnemies(dt)
    this.moveEnemies(dt)
    this.updateBullets(dt)
    this.updateProjectiles(dt)
    this.updateOrbs(dt)
    this.updateBlast(dt)
    this.collideEnemiesWithPlayer(dt)
    this.collectGems()
    this.updateFloats(dt)
    this.checkLevelUp()
    this.checkDeath()
  }

  private movePlayer(dt: number): void {
    const p = this.player
    if (p.invulnMs > 0) p.invulnMs = Math.max(0, p.invulnMs - dt * 1000)
    const len = Math.hypot(this.moveDir.x, this.moveDir.y)
    if (len > 0.01) {
      const nx = this.moveDir.x / len
      const ny = this.moveDir.y / len
      p.x = clamp(p.x + nx * p.speed * dt, PLAYER_RADIUS, WORLD_WIDTH - PLAYER_RADIUS)
      p.y = clamp(p.y + ny * p.speed * dt, PLAYER_RADIUS, WORLD_HEIGHT - PLAYER_RADIUS)
      p.facing = Math.atan2(ny, nx)
    }
  }

  private spawnEnemies(dt: number): void {
    this.spawnTimer += dt * 1000
    const interval = spawnIntervalMs(this.timeSec)
    if (this.spawnTimer < interval) return
    this.spawnTimer = 0
    const batch = spawnBatch(this.timeSec)
    for (let i = 0; i < batch; i++) this.spawnOne()
  }

  private spawnOne(): void {
    const t = this.timeSec
    const angle = Math.random() * Math.PI * 2
    const spawnDist = 520
    const x = clamp(this.player.x + Math.cos(angle) * spawnDist, 10, WORLD_WIDTH - 10)
    const y = clamp(this.player.y + Math.sin(angle) * spawnDist, 10, WORLD_HEIGHT - 10)

    // Choose kind by time-gated probability.
    let kind: EnemyKind = 'slime'
    const r = Math.random()
    if (t > 90 && r < 0.18) kind = 'tank'
    else if (t > 30 && r < 0.45) kind = 'fast'

    const scale = enemyHpScale(t)
    let base: Omit<Enemy, 'x' | 'y' | 'hitCooldownMs'>
    if (kind === 'fast') {
      base = { radius: 10, hp: 14 * scale, maxHp: 14 * scale, speed: 118, damage: 10, kind }
    } else if (kind === 'tank') {
      base = { radius: 22, hp: 90 * scale, maxHp: 90 * scale, speed: 48, damage: 22, kind }
    } else {
      base = { radius: 14, hp: 30 * scale, maxHp: 30 * scale, speed: 66, damage: 12, kind }
    }
    this.enemies.push({ ...base, x, y, hitCooldownMs: 0 })
  }

  private checkBossWave(dt: number): void {
    // Tick announcement timer first.
    if (this.bossAnnounceMs > 0) {
      this.bossAnnounceMs = Math.max(0, this.bossAnnounceMs - dt * 1000)
      // When announcement finishes, actually spawn the boss.
      if (this.bossAnnounceMs === 0 && this.bossSpawnPending) {
        this.bossSpawnPending = false
        this.spawnBoss()
      }
      return
    }
    // Check if it's time to announce a new boss.
    if (this.timeSec >= this.nextBossSec) {
      // Only one boss at a time.
      const bossAlive = this.enemies.some((e) => e.isBoss)
      if (!bossAlive) {
        this.nextBossSec += BOSS_INTERVAL_SEC
        this.bossAnnounceMs = BOSS_ANNOUNCE_MS
        this.bossSpawnPending = true
      } else {
        // Delay until the current boss is dead.
        this.nextBossSec += 10
      }
    }
  }

  private spawnBoss(): void {
    const t = this.timeSec
    const angle = Math.random() * Math.PI * 2
    const spawnDist = 520
    const x = clamp(this.player.x + Math.cos(angle) * spawnDist, 10, WORLD_WIDTH - 10)
    const y = clamp(this.player.y + Math.sin(angle) * spawnDist, 10, WORLD_HEIGHT - 10)

    const scale = enemyHpScale(t)
    const baseHp = 300 * scale * 10 // 10x tank base health
    const boss: Enemy = {
      x,
      y,
      radius: 44, // ~2x tank radius
      hp: baseHp,
      maxHp: baseHp,
      speed: 52,
      damage: 28,
      kind: 'tank',
      hitCooldownMs: 0,
      isBoss: true,
    }
    this.enemies.push(boss)
  }

  private moveEnemies(dt: number): void {
    const p = this.player
    for (const e of this.enemies) {
      if (e.hitCooldownMs > 0) e.hitCooldownMs -= dt * 1000
      const dx = p.x - e.x
      const dy = p.y - e.y
      const d = Math.hypot(dx, dy) || 1
      e.x += (dx / d) * e.speed * dt
      e.y += (dy / d) * e.speed * dt
    }
    // Light separation so they don't fully stack.
    for (let i = 0; i < this.enemies.length; i++) {
      const a = this.enemies[i]
      for (let j = i + 1; j < this.enemies.length; j++) {
        const b = this.enemies[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const min = a.radius + b.radius
        const d2 = dx * dx + dy * dy
        if (d2 > 0 && d2 < min * min) {
          const d = Math.sqrt(d2)
          const push = (min - d) / 2
          const ux = dx / d
          const uy = dy / d
          a.x -= ux * push
          a.y -= uy * push
          b.x += ux * push
          b.y += uy * push
        }
      }
    }
  }

  private nearestEnemy(): Enemy | null {
    let best: Enemy | null = null
    let bestD = Infinity
    for (const e of this.enemies) {
      const d = dist2(e.x, e.y, this.player.x, this.player.y)
      if (d < bestD) {
        bestD = d
        best = e
      }
    }
    return best
  }

  private updateBullets(dt: number): void {
    this.bulletTimer += dt * 1000
    if (this.bulletTimer < this.bulletCooldownMs) return
    const target = this.nearestEnemy()
    if (!target) {
      // hold the timer ready so it fires the instant an enemy appears
      this.bulletTimer = this.bulletCooldownMs
      return
    }
    this.bulletTimer = 0
    const baseAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x)
    const speed = 460
    const spread = 0.18
    for (let i = 0; i < this.bulletCount; i++) {
      const offset = (i - (this.bulletCount - 1) / 2) * spread
      const a = baseAngle + offset
      this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        radius: 5,
        damage: this.bulletDamage,
        pierce: this.bulletPierce,
        lifeMs: 1400,
      })
    }
  }

  private updateProjectiles(dt: number): void {
    const next: Projectile[] = []
    for (const pr of this.projectiles) {
      pr.x += pr.vx * dt
      pr.y += pr.vy * dt
      pr.lifeMs -= dt * 1000
      if (pr.lifeMs <= 0) continue
      let dead = false
      for (const e of this.enemies) {
        const rr = pr.radius + e.radius
        if (dist2(pr.x, pr.y, e.x, e.y) <= rr * rr) {
          this.damageEnemy(e, pr.damage)
          if (pr.pierce > 0) {
            pr.pierce -= 1
          } else {
            dead = true
            break
          }
        }
      }
      if (!dead) next.push(pr)
    }
    this.projectiles = next
  }

  private updateOrbs(dt: number): void {
    if (this.orbCount <= 0) return
    this.orbAngle += dt * 2.4
    for (let i = 0; i < this.orbCount; i++) {
      const a = this.orbAngle + (Math.PI * 2 * i) / this.orbCount
      const ox = this.player.x + Math.cos(a) * this.orbOrbitRadius
      const oy = this.player.y + Math.sin(a) * this.orbOrbitRadius
      const orbR = 12
      for (const e of this.enemies) {
        if (e.hitCooldownMs > 0) continue
        const rr = orbR + e.radius
        if (dist2(ox, oy, e.x, e.y) <= rr * rr) {
          this.damageEnemy(e, this.orbDamage)
          e.hitCooldownMs = ORB_HIT_COOLDOWN_MS
        }
      }
    }
  }

  private updateBlast(dt: number): void {
    if (this.blastDamage <= 0) return
    this.blastTimer += dt * 1000
    if (this.blastTimer < this.blastCooldownMs) return
    this.blastTimer = 0
    const rr = this.blastRadius
    for (const e of this.enemies) {
      if (e.hitCooldownMs > 0) continue
      if (dist2(this.player.x, this.player.y, e.x, e.y) <= rr * rr) {
        this.damageEnemy(e, this.blastDamage)
        e.hitCooldownMs = BLAST_HIT_COOLDOWN_MS
      }
    }
    this.floats.push({
      x: this.player.x,
      y: this.player.y,
      text: '',
      lifeMs: 280,
      color: 'blast',
    })
  }

  private damageEnemy(e: Enemy, dmg: number): void {
    e.hp -= dmg
    if (e.hp <= 0) {
      this.killEnemy(e)
    }
  }

  private killEnemy(e: Enemy): void {
    const idx = this.enemies.indexOf(e)
    if (idx === -1) return
    this.enemies.splice(idx, 1)
    this.kills += 1
    if (e.isBoss) {
      // Boss drops a large XP gem (guaranteed level-up boost) + bonus gems.
      this.gems.push({ x: e.x, y: e.y, value: 50 })
      for (let i = 0; i < 8; i++) {
        this.gems.push({
          x: e.x + (Math.random() - 0.5) * 80,
          y: e.y + (Math.random() - 0.5) * 80,
          value: 10,
        })
      }
      this.floats.push({ x: e.x, y: e.y - 30, text: '👑 BOSS DOWN', lifeMs: 2000, color: '#fbbf24' })
      // Trigger special boss upgrade selection.
      this.status = 'bossupgrade'
    } else {
      const value = e.kind === 'tank' ? 5 : e.kind === 'fast' ? 2 : 1
      this.gems.push({ x: e.x, y: e.y, value })
    }
  }

  private collideEnemiesWithPlayer(dt: number): void {
    const p = this.player
    if (p.invulnMs > 0) return
    for (const e of this.enemies) {
      const rr = e.radius + PLAYER_RADIUS
      if (dist2(e.x, e.y, p.x, p.y) <= rr * rr) {
        p.hp -= e.damage
        p.invulnMs = PLAYER_INVULN_MS
        break
      }
    }
  }

  private collectGems(): void {
    const p = this.player
    const range = p.pickupRange
    const next: Gem[] = []
    for (const g of this.gems) {
      const d2 = dist2(g.x, g.y, p.x, p.y)
      // attract within range
      if (d2 <= range * range) {
        const d = Math.sqrt(d2) || 1
        if (d < 16) {
          p.xp += g.value
          continue
        }
        g.x += ((p.x - g.x) / d) * 320 * (1 / 60)
        g.y += ((p.y - g.y) / d) * 320 * (1 / 60)
      }
      next.push(g)
    }
    this.gems = next
  }

  private updateFloats(dt: number): void {
    for (const f of this.floats) f.lifeMs -= dt * 1000
    this.floats = this.floats.filter((f) => f.lifeMs > 0)
  }

  private checkLevelUp(): void {
    const p = this.player
    if (p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext
      p.level += 1
      p.xpToNext = xpForLevel(p.level)
      // Boss reward screen takes priority; level-up is already applied above.
      if (this.status !== 'bossupgrade') {
        this.status = 'levelup'
      }
    }
  }

  private checkDeath(): void {
    if (this.player.hp <= 0) {
      this.player.hp = 0
      this.status = 'gameover'
      if (this.timeSec > this.bestTimeSec) this.bestTimeSec = this.timeSec
    }
  }
}
