import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionToken } from '@/lib/admin-session'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(req: NextRequest) {
  if (!ADMIN_PASSWORD) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Admin login is not configured' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Set ADMIN_PASSWORD in server/.env for local admin login' },
      { status: 503 },
    )
  }

  const { password } = (await req.json()) as { password: string }
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = await createAdminSessionToken()
  if (!token) {
    return NextResponse.json({ error: 'Admin session secret is not configured' }, { status: 503 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
