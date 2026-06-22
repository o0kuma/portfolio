import { cookies } from 'next/headers'
import { verifyAdminSessionToken } from '@/lib/admin-session'

/** Cookie-based admin session set by POST /api/admin/login. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyAdminSessionToken(cookieStore.get('admin_session')?.value)
}

/** Bearer ADMIN_API_TOKEN (scripts, legacy admin UI). */
export function isAdminBearerAuthorized(request: Request): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN?.trim()
  if (!adminToken) return false
  const auth = request.headers.get('authorization') ?? ''
  const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  return provided === adminToken
}

/** Accept HTTP-only admin cookie or Bearer token for mutating admin APIs. */
export async function isAdminAuthorized(request: Request): Promise<boolean> {
  if (await isAdminAuthenticated()) return true
  return isAdminBearerAuthorized(request)
}
