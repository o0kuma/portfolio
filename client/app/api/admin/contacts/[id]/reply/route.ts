export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/adminAuth'
import { dbQuery } from '@/lib/neon-server'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

type Ctx = { params: { id: string } }

async function createTransporter() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://kuuuma.com/auth/callback',
  )
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  const { token } = await oauth2Client.getAccessToken()
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.SMTP_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: token ?? undefined,
    },
  } as Parameters<typeof nodemailer.createTransport>[0])
}

export async function POST(
  request: NextRequest,
  { params }: Ctx,
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  const { id } = params

  try {
    const body = await request.json()
    const { body: replyBody } = body as { body: string }
    if (!replyBody?.trim()) {
      return NextResponse.json({ success: false, error: '답장 내용이 필요합니다.' }, { status: 400 })
    }

    // Fetch contact
    const result = await dbQuery<{ id: string; name: string; email: string; subject: string }>(
      `SELECT id, name, email, subject FROM contacts WHERE id = $1`,
      [id],
    )
    const contact = result.rows[0]
    if (!contact) {
      return NextResponse.json({ success: false, error: '연락처를 찾을 수 없습니다.' }, { status: 404 })
    }

    const smtpUser = process.env.SMTP_USER || ''
    const transporter = await createTransporter()

    await transporter.sendMail({
      from: smtpUser,
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>안녕하세요, <strong>${contact.name}</strong>님!</p>
          <div style="white-space: pre-wrap; line-height: 1.8; margin: 20px 0;">
            ${replyBody.replace(/\n/g, '<br>')}
          </div>
          <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #555;"><strong>오승일</strong><br>프론트엔드 개발자<br>${smtpUser}</p>
          </div>
        </div>
      `,
    })

    // Update status to replied
    await dbQuery(`UPDATE contacts SET status = 'replied' WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[admin/contacts/reply]', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
