import { describe, it, expect } from 'vitest'
import { interpolate } from '../i18n'

describe('interpolate', () => {
  it('replaces single variable', () => {
    expect(interpolate('Hello {name}!', { name: 'World' })).toBe('Hello World!')
  })

  it('replaces multiple variables', () => {
    expect(interpolate('{a} + {b} = {c}', { a: '1', b: '2', c: '3' })).toBe('1 + 2 = 3')
  })

  it('replaces missing variables with empty string', () => {
    expect(interpolate('Hello {name}!', {})).toBe('Hello !')
  })

  it('handles number values', () => {
    expect(interpolate('Wave {n}', { n: 5 })).toBe('Wave 5')
  })
})
