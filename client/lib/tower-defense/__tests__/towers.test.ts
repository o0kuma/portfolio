import { describe, it, expect } from 'vitest'
import { evolutionFor } from '../towers'

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
