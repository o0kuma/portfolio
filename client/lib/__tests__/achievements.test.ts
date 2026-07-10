import { describe, it, expect, beforeEach } from 'vitest'
import { ACHIEVEMENTS, getEarned, getEarnedIds, markEarned, checkAchievements } from '@/lib/achievements'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, configurable: true })

describe('achievements', () => {
  beforeEach(() => localStorageMock.clear())

  it('every achievement id is unique', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('markEarned', () => {
    it('returns true the first time an id is recorded', () => {
      expect(markEarned('site_explorer')).toBe(true)
    })

    it('returns false on repeat calls — this is what ExplorationBadge relies on to fire the toast exactly once', () => {
      markEarned('site_explorer')
      expect(markEarned('site_explorer')).toBe(false)
      expect(markEarned('site_explorer')).toBe(false)
    })

    it('persists to storage and is reflected by getEarned/getEarnedIds', () => {
      markEarned('first_game')
      expect(getEarnedIds()).toContain('first_game')
      expect(getEarned().find((e) => e.id === 'first_game')).toBeTruthy()
    })
  })

  describe('checkAchievements', () => {
    it('awards first_game on the first play of any game', () => {
      const newly = checkAchievements('tetris', { score: 0, lines: 0 })
      expect(newly.map((a) => a.id)).toContain('first_game')
    })

    it('does not re-award first_game on a second play', () => {
      checkAchievements('tetris', { score: 0, lines: 0 })
      const second = checkAchievements('tetris', { score: 0, lines: 0 })
      expect(second.map((a) => a.id)).not.toContain('first_game')
    })

    it('awards tetris_master only past the score threshold', () => {
      const below = checkAchievements('tetris', { score: 4999, lines: 0 })
      expect(below.map((a) => a.id)).not.toContain('tetris_master')

      localStorageMock.clear()
      const above = checkAchievements('tetris', { score: 5000, lines: 0 })
      expect(above.map((a) => a.id)).toContain('tetris_master')
    })

    it('awards all_games only once every distinct game has been played', () => {
      checkAchievements('tetris', {})
      checkAchievements('survive', {})
      checkAchievements('tower-defense', {})
      const final = checkAchievements('typing', {})
      expect(final.map((a) => a.id)).toContain('all_games')
    })
  })
})
