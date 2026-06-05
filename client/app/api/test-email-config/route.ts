export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

function checkAdminAuth(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN
  if (!adminToken) return false
  const auth = request.headers.get('authorization') ?? ''
  const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  return provided === adminToken
}

// Admin-only email configuration health check (no secret values in response).
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const config = {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      hasSmtpUser: !!process.env.SMTP_USER,
    }

    const allConfigured =
      config.hasClientId &&
      config.hasClientSecret &&
      config.hasRefreshToken &&
      config.hasSmtpUser

    if (allConfigured) {
      return NextResponse.json({
        success: true,
        message: '이메일 설정이 올바르게 구성되었습니다.',
        config,
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: '이메일 설정이 완전하지 않습니다.',
        config,
      },
      { status: 500 },
    )
  } catch (error) {
    console.error('이메일 설정 테스트 오류:', error)
    return NextResponse.json(
      {
        success: false,
        message: '이메일 설정 테스트에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
