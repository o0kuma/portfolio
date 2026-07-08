import { describe, it, expect, beforeEach } from 'vitest'
import { ensureRefPresenceId, readOrCreatePresenceId } from '../rpg-presence'

function mockStorage(): Storage {
  const map = new Map<string, string>()
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => { map.set(k, v) },
    removeItem: (k) => { map.delete(k) },
    clear: () => { map.clear() },
    key: () => null,
    length: 0,
  }
}

describe('rpg-presence', () => {
  let storage: Storage

  beforeEach(() => {
    storage = mockStorage()
  })

  it('returns empty string when storage is unavailable (SSR)', () => {
    expect(readOrCreatePresenceId(null)).toBe('')
  })

  it('creates and persists a new id', () => {
    const id = readOrCreatePresenceId(storage)
    expect(id.length).toBeGreaterThan(0)
    expect(storage.getItem('rpg-presence-id')).toBe(id)
  })

  it('ensureRefPresenceId fills an empty ref after hydration', () => {
    const ref = { current: '' }
    const id = ensureRefPresenceId(ref, storage)
    expect(id).toBeTruthy()
    expect(ref.current).toBe(id)
    expect(ensureRefPresenceId(ref, storage)).toBe(id)
  })
})
