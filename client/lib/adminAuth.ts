import { cookies } from 'next/headers'
import { verifyAdminSessionToken } from '@/lib/admin-session'

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyAdminSessionToken(cookieStore.get('admin_session')?.value)
}
