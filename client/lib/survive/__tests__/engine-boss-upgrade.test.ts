import { describe, expect, it } from 'vitest'
import { SurviveEngine } from '../engine'

type EngineInternals = SurviveEngine & {
  collectGems(): void
  checkLevelUp(): void
}

describe('SurviveEngine boss upgrade', () => {
  it('preserves bossupgrade when boss XP crosses level threshold same frame', () => {
    const engine = new SurviveEngine()
    engine.status = 'playing'
    engine.player.xp = engine.player.xpToNext - 1

    // Boss kill drops a 50 XP gem at the player and sets bossupgrade.
    engine.gems.push({ x: engine.player.x, y: engine.player.y, value: 50 })
    engine.status = 'bossupgrade'

    const internals = engine as EngineInternals
    internals.collectGems()
    internals.checkLevelUp()

    expect(engine.status).toBe('bossupgrade')
    expect(engine.player.level).toBe(2)
  })

  it('enters levelup when XP threshold crossed during normal play', () => {
    const engine = new SurviveEngine()
    engine.status = 'playing'
    engine.player.xp = engine.player.xpToNext

    ;(engine as EngineInternals).checkLevelUp()

    expect(engine.status).toBe('levelup')
    expect(engine.player.level).toBe(2)
  })
})
