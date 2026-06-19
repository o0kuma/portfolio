import { describe, it, expect } from 'vitest'

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

describe('readingTime', () => {
  it('returns 1 for empty content', () => {
    expect(readingTime('')).toBe(1)
  })
  it('returns 1 for short content', () => {
    expect(readingTime('Hello world')).toBe(1)
  })
  it('calculates correctly for 400 words', () => {
    const content = Array(400).fill('word').join(' ')
    expect(readingTime(content)).toBe(2)
  })
  it('rounds correctly', () => {
    const content = Array(299).fill('word').join(' ')
    expect(readingTime(content)).toBe(1)
    const content2 = Array(301).fill('word').join(' ')
    expect(readingTime(content2)).toBe(2)
  })
})
