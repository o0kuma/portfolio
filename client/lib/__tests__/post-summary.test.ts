import { describe, expect, it } from 'vitest'
import { buildPostSummaryPrompt, parseGeminiSummaryResponse } from '../post-summary'

describe('post-summary', () => {
  it('buildPostSummaryPrompt truncates long content', () => {
    const long = 'a'.repeat(4000)
    const prompt = buildPostSummaryPrompt(long)
    expect(prompt.length).toBeLessThan(4000)
    expect(prompt).toContain('a'.repeat(3000))
    expect(prompt).not.toContain('a'.repeat(3001))
  })

  it('parseGeminiSummaryResponse extracts summary text', () => {
    expect(
      parseGeminiSummaryResponse({
        choices: [{ message: { content: '• 첫 줄\n• 둘째 줄' } }],
      }),
    ).toBe('• 첫 줄\n• 둘째 줄')
  })

  it('parseGeminiSummaryResponse returns null for empty choices', () => {
    expect(parseGeminiSummaryResponse({ choices: [] })).toBeNull()
    expect(parseGeminiSummaryResponse({})).toBeNull()
  })
})
