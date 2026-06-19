import type { NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

/** Accept signed admin cookie session or Bearer ADMIN_API_TOKEN. */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  if (await isAdminAuthenticated()) return true

  const adminToken = process.env.ADMIN_API_TOKEN
  const auth = request.headers.get('authorization') ?? ''
  const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  return Boolean(adminToken && provided === adminToken)
}
