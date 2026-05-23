import { getStoredAdminToken } from './admin-token'

/** True when admin UI should be shown (token stored in localStorage only). */
export function hasAdminAccess(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(getStoredAdminToken())
}
