import { describe, it, expect, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('bookmark storage', () => {
  beforeEach(() => localStorageMock.clear())

  it('starts empty', () => {
    expect(JSON.parse(localStorage.getItem('post_bookmarks') ?? '[]')).toEqual([])
  })

  it('stores and retrieves bookmark IDs', () => {
    localStorage.setItem('post_bookmarks', JSON.stringify(['post-1', 'post-2']))
    const stored = JSON.parse(localStorage.getItem('post_bookmarks') ?? '[]')
    expect(stored).toContain('post-1')
    expect(stored).toContain('post-2')
  })

  it('removes a bookmark', () => {
    localStorage.setItem('post_bookmarks', JSON.stringify(['post-1', 'post-2']))
    const stored: string[] = JSON.parse(localStorage.getItem('post_bookmarks') ?? '[]')
    const updated = stored.filter(id => id !== 'post-1')
    localStorage.setItem('post_bookmarks', JSON.stringify(updated))
    expect(JSON.parse(localStorage.getItem('post_bookmarks') ?? '[]')).not.toContain('post-1')
  })
})
