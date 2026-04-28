export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'
import { dbQuery } from '@/lib/neon-server'

// 연락처 메시지 전송 API - Supabase에 저장만 수행
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 유효성 검사
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 클라이언트 IP 및 User-Agent
    const headers = request.headers
    const ip_address = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'
    const user_agent = headers.get('user-agent') || 'unknown'

    const insertResult = await dbQuery<{ id: string }>(
      `INSERT INTO contacts (name, email, subject, message, status, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, 'unread', $5, $6)
       RETURNING id`,
      [body.name, body.email, body.subject, body.message, ip_address, user_agent]
    )

    // 이메일 전송 시도 (선택 사항)
    let emailSent = false
    let emailError: string | undefined = undefined

    // 이메일 전송 환경 변수 확인
    const hasEmailConfig = 
      process.env.SMTP_USER &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN

    if (hasEmailConfig) {
      try {
        console.log('이메일 전송 시작...')
        const emailResult = await sendContactEmail({
          name: body.name,
          email: body.email,
          subject: body.subject,
          message: body.message
        })
        
        if (emailResult.success) {
          emailSent = true
          console.log('✅ 이메일 전송 성공')
        } else {
          emailError = emailResult.error || emailResult.message
          console.error('❌ 이메일 전송 실패:', emailError)
        }
      } catch (emailErr: any) {
        console.error('이메일 전송 오류:', emailErr)
        emailError = emailErr.message || '이메일 전송에 실패했습니다.'
      }
    } else {
      emailError = '이메일 전송 환경 변수가 설정되지 않았습니다. (SMTP_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)'
    }

    // 성공 응답
    return NextResponse.json(
      {
        success: true,
        message: '메시지가 성공적으로 저장되었습니다.',
        contactId: insertResult.rows[0]?.id,
        emailSent,
        emailError: emailError || undefined
      },
      { status: 201 }
    )
  } catch (e: any) {
    console.error('연락처 API 오류:', e)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.', error: e?.message || 'unknown' },
      { status: 500 }
    )
  }
}