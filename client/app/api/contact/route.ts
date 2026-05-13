export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'
import { dbQuery } from '@/lib/neon-server'

// Contact form handler.
// DB save and email dispatch are intentionally independent:
// a DB failure must NOT prevent the email from being sent.
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    const headers = request.headers
    const ip_address = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'
    const user_agent = headers.get('user-agent') || 'unknown'

    // ── 1) DB 저장 (실패해도 아래 이메일 전송 계속 진행) ─────────────────
    let contactId: string | undefined
    let dbError: string | undefined

    try {
      const insertResult = await dbQuery<{ id: string }>(
        `INSERT INTO contacts (name, email, subject, message, status, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, 'unread', $5, $6)
         RETURNING id`,
        [body.name, body.email, body.subject, body.message, ip_address, user_agent]
      )
      contactId = insertResult.rows[0]?.id
      console.log('✅ DB 저장 성공, contactId:', contactId)
    } catch (dbErr: any) {
      dbError = dbErr?.message || 'DB 저장 실패'
      console.warn('⚠️ DB 저장 실패 (이메일 전송은 계속 진행):', dbError)
    }

    // ── 2) 이메일 전송 (DB 저장 여부와 무관하게 실행) ─────────────────────
    let emailSent = false
    let emailError: string | undefined

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
          message: body.message,
        })

        if (emailResult.success) {
          emailSent = true
          console.log('✅ 이메일 전송 성공')
        } else {
          emailError = emailResult.error || emailResult.message
          console.error('❌ 이메일 전송 실패:', emailError)
        }
      } catch (emailErr: any) {
        emailError = emailErr?.message || '이메일 전송에 실패했습니다.'
        console.error('이메일 전송 오류:', emailErr)
      }
    } else {
      emailError =
        '이메일 전송 환경 변수가 설정되지 않았습니다. ' +
        '(필요: SMTP_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)'
      console.warn('⚠️', emailError)
    }

    // ── 3) 응답 ────────────────────────────────────────────────────────────
    // DB와 이메일 중 하나라도 성공하면 201 반환.
    // 둘 다 실패해도 사용자에게 친절한 메시지를 돌려줌(500 아님).
    const savedToDb = !dbError

    return NextResponse.json(
      {
        success: true,
        message: savedToDb
          ? '메시지가 성공적으로 저장되었습니다.'
          : 'DB 저장에 실패했지만 메시지를 접수했습니다.',
        contactId,
        savedToDb,
        dbError: dbError || undefined,
        emailSent,
        emailError: emailError || undefined,
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