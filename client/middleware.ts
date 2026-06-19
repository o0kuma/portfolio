import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSessionToken } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes (but not /api/admin/login itself)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin/login')) {
    const session = request.cookies.get('admin_session')
    const authenticated = await verifyAdminSessionToken(session?.value)
    if (!authenticated) {
      const loginUrl = new URL('/admin', request.url)
      // If it's an API call, return 401
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      // Otherwise redirect to admin login page
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
