import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// aiStats holds module-level mutable counters, so reload the module fresh
// for every test to avoid state leaking between cases.
async function freshAiStats() {
  vi.resetModules()
  return await import('@/lib/aiStats')
}

describe('aiStats', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at zero', async () => {
    const { getAiStats } = await freshAiStats()
    expect(getAiStats()).toEqual({ total: 0, today: 0 })
  })

  it('increments both total and today on each request', async () => {
    const { recordAiRequest, getAiStats } = await freshAiStats()
    recordAiRequest()
    recordAiRequest()
    recordAiRequest()
    expect(getAiStats()).toEqual({ total: 3, today: 3 })
  })

  it('resets the daily counter but not the total when the date rolls over', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-10T23:00:00'))
    const { recordAiRequest, getAiStats } = await freshAiStats()
    recordAiRequest()
    recordAiRequest()
    expect(getAiStats()).toEqual({ total: 2, today: 2 })

    vi.setSystemTime(new Date('2026-07-11T00:30:00'))
    recordAiRequest()
    expect(getAiStats()).toEqual({ total: 3, today: 1 })
  })
})
