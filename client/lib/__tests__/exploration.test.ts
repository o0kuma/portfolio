import { describe, it, expect, beforeEach } from 'vitest'
import { LANDMARKS, getVisited, markVisited, pathToLandmark } from '@/lib/exploration'

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

describe('exploration', () => {
  beforeEach(() => localStorageMock.clear())

  it('starts with nothing visited', () => {
    expect(getVisited().size).toBe(0)
  })

  it('marks a landmark visited and returns true the first time', () => {
    expect(markVisited('home')).toBe(true)
    expect(getVisited().has('home')).toBe(true)
  })

  it('returns false when the same landmark is marked again', () => {
    markVisited('home')
    expect(markVisited('home')).toBe(false)
  })

  it('persists visited landmarks across calls', () => {
    markVisited('posts')
    markVisited('food')
    const visited = getVisited()
    expect(visited.has('posts')).toBe(true)
    expect(visited.has('food')).toBe(true)
    expect(visited.size).toBe(2)
  })

  it('every landmark key is unique', () => {
    const keys = LANDMARKS.map((l) => l.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  describe('pathToLandmark', () => {
    it.each([
      ['/', 'home'],
      ['/portfolio', 'portfolio'],
      ['/portfolio/some-slug', 'portfolio'],
      ['/posts', 'posts'],
      ['/posts/123', 'posts'],
      ['/food', 'food'],
      ['/games', 'games'],
      ['/tetris', 'games'],
      ['/survive', 'games'],
      ['/tower-defense', 'games'],
      ['/typing-game', 'games'],
      ['/arcade', 'games'],
      ['/rpg', 'rpg'],
      ['/terminal', 'terminal'],
    ])('maps %s to %s', (path, expected) => {
      expect(pathToLandmark(path)).toBe(expected)
    })

    it('returns null for routes with no landmark', () => {
      expect(pathToLandmark('/admin')).toBeNull()
      expect(pathToLandmark('/privacy')).toBeNull()
    })
  })
})
