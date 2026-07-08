/** Read or create a stable per-tab presence id (client-only). */
export function readOrCreatePresenceId(storage: Storage | null): string {
  if (!storage) return ''
  let id = storage.getItem('rpg-presence-id')
  if (!id) {
    id = Math.random().toString(36).slice(2, 10)
    storage.setItem('rpg-presence-id', id)
  }
  return id
}

/** Fill an empty ref after mount — SSR leaves useRef('') frozen through hydration. */
export function ensureRefPresenceId(ref: { current: string }, storage: Storage | null): string {
  if (!ref.current) ref.current = readOrCreatePresenceId(storage)
  return ref.current
}
