import { getStoredAdminToken } from './admin-token'

/** True when admin UI should be shown (stored token or deployment hint env). */
export function hasAdminAccess(): boolean {
  if (typeof window === 'undefined') return false
  if (getStoredAdminToken()) return true
  return Boolean(process.env.NEXT_PUBLIC_ADMIN_TOKEN?.trim())
}
