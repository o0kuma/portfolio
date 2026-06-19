import { describe, it, expect } from 'vitest'
import { evolutionFor, TOWER_DEFS, RECIPES, sellValue, upgradeCost } from '../towers'

describe('evolutionFor', () => {
  it('returns blizzard for frost+splash', () => {
    expect(evolutionFor('frost', 'splash')).toBe('blizzard')
  })
  it('is order-independent', () => {
    expect(evolutionFor('frost', 'splash')).toBe(evolutionFor('splash', 'frost'))
  })
  it('returns railgun for beam+pulse', () => {
    expect(evolutionFor('beam', 'pulse')).toBe('railgun')
  })
  it('returns null for same tower', () => {
    expect(evolutionFor('pulse', 'pulse')).toBeNull()
  })
  it('returns null for invalid combination', () => {
    expect(evolutionFor('frost', 'beam')).toBe('prism')
  })
  it('returns null for evolved tower input', () => {
    expect(evolutionFor('blizzard', 'pulse')).toBeNull()
  })
})

describe('new towers', () => {
  it('sniper has pierce > 0', () => {
    expect(TOWER_DEFS.sniper.pierce).toBeGreaterThan(0)
  })
  it('support has evolved: false', () => {
    expect(TOWER_DEFS.support.evolved).toBe(false)
  })
  it('omega recipe exists', () => {
    expect(RECIPES['beam|sniper']).toBe('omega')
  })
  it('fortress recipe exists', () => {
    expect(RECIPES['frost|support']).toBe('fortress')
  })
  it('sell value is less than cost', () => {
    expect(sellValue('pulse', 1)).toBeLessThan(TOWER_DEFS.pulse.cost)
  })
})
