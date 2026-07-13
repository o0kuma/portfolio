import { describe, it, expect } from 'vitest'
import { plainTextExcerpt } from '@/lib/textExcerpt'

describe('plainTextExcerpt', () => {
  it('strips markdown code fences entirely', () => {
    expect(plainTextExcerpt('Before ```const x = 1``` after')).toBe('Before after')
  })

  it('strips markdown syntax characters', () => {
    expect(plainTextExcerpt('# Heading\n**bold** _italic_ [link](url) > quote')).toBe('Heading bold italic link url quote')
  })

  it('strips HTML tags', () => {
    expect(plainTextExcerpt('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('collapses whitespace', () => {
    expect(plainTextExcerpt('a   b\n\nc\t\td')).toBe('a b c d')
  })

  it('returns short text unchanged', () => {
    expect(plainTextExcerpt('short text')).toBe('short text')
  })

  it('truncates long text with an ellipsis at the max length', () => {
    const long = 'x'.repeat(200)
    const result = plainTextExcerpt(long, 160)
    expect(result.length).toBe(160)
    expect(result.endsWith('…')).toBe(true)
  })

  it('respects a custom maxLen', () => {
    const result = plainTextExcerpt('a'.repeat(50), 10)
    expect(result.length).toBe(10)
  })
})
