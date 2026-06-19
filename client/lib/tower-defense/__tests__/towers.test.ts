import { describe, it, expect } from 'vitest'
import { evolutionFor } from '../towers'

describe('evolutionFor', () => {
  it('returns evolution for valid recipe', () => {
    const result = evolutionFor('frost', 'splash')
    expect(result).toBeTruthy()
  })

  it('is order-independent', () => {
    const a = evolutionFor('frost', 'splash')
    const b = evolutionFor('splash', 'frost')
    expect(a).toBe(b)
  })

  it('returns null for invalid combination', () => {
    const result = evolutionFor('pulse', 'pulse')
    expect(result).toBeNull()
  })
})
