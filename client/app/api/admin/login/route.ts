import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionToken } from '@/lib/admin-session'

function getAdminPassword(): string | null {
  const configured = process.env.ADMIN_PASSWORD?.trim()
  if (configured) return configured
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return null
  }
  return 'admin'
}

export async function POST(req: NextRequest) {
  const adminPassword = getAdminPassword()
  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 503 })
  }

  const { password } = (await req.json()) as { password: string }
  if (password !== adminPassword) {
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
