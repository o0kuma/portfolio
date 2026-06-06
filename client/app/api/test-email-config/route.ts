import { NextResponse } from 'next/server';

// 이메일 설정 테스트 API (development only)
export async function GET() {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  try {
    // 환경변수 확인
    const config = {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      smtpUser: process.env.SMTP_USER,
      // 디버깅을 위한 실제 값들 (보안상 일부만 표시)
      clientIdValue: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'NOT_SET',
      clientSecretValue: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...' : 'NOT_SET',
      refreshTokenValue: process.env.GOOGLE_REFRESH_TOKEN ? process.env.GOOGLE_REFRESH_TOKEN.substring(0, 10) + '...' : 'NOT_SET',
      smtpUserValue: process.env.SMTP_USER || 'NOT_SET',
      // 모든 환경변수 목록 확인
      allEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('SMTP'))
    };

    const allConfigured = config.hasClientId && config.hasClientSecret && config.hasRefreshToken && config.smtpUser;

    if (allConfigured) {
      return NextResponse.json({
        success: true,
        message: '이메일 설정이 올바르게 구성되었습니다.',
        config
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '이메일 설정이 완전하지 않습니다.',
        config
      }, { status: 500 });
    }

  } catch (error) {
    console.error('이메일 설정 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      message: '이메일 설정 테스트에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
