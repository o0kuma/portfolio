const STORAGE_KEY = 'admin_token'

/** Admin API token stored in localStorage (never use NEXT_PUBLIC_* for secrets). */
export function getStoredAdminToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(STORAGE_KEY)?.trim() ?? ''
}

export function setStoredAdminToken(token: string): void {
  if (typeof window === 'undefined') return
  const trimmed = token.trim()
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function adminAuthHeaders(): Record<string, string> {
  const token = getStoredAdminToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
