import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

function createOAuth2Client(): OAuth2Client {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://kuuuma.com/auth/callback'
  )
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return oauth2Client
}

async function createTransporter() {
  const oauth2Client = createOAuth2Client()
  const { token: accessToken } = await oauth2Client.getAccessToken()
  if (!accessToken) throw new Error('액세스 토큰을 가져올 수 없습니다.')

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.SMTP_USER!,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
      accessToken,
      expires: 3600,
    },
  })
}

export async function sendNewsletterEmail({
  to,
  title,
  excerpt,
  postUrl,
  unsubscribeToken,
}: {
  to: string
  title: string
  excerpt: string
  postUrl: string
  unsubscribeToken: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kuuuma.com'
  const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`

  const transporter = await createTransporter()

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `새 글이 올라왔어요: ${title}`,
    html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#171717;border:1px solid #262626;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0e7490,#0891b2);padding:32px 24px;">
        <p style="margin:0 0 8px;color:#cffafe;font-size:13px;font-family:monospace;">새 글 알림</p>
        <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.4;">${title}</h1>
      </div>

      <div style="padding:24px;">
        <p style="margin:0 0 16px;color:#a3a3a3;font-size:15px;line-height:1.7;">
          안녕하세요! 새 글을 확인해보세요.
        </p>

        <div style="background-color:#262626;border-radius:8px;padding:16px;margin:0 0 24px;">
          <p style="margin:0;color:#d4d4d4;font-size:14px;line-height:1.7;">
            ${excerpt}…
          </p>
        </div>

        <a
          href="${postUrl}"
          style="display:inline-block;background-color:#0891b2;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:bold;"
        >
          읽으러 가기 →
        </a>
      </div>

      <div style="border-top:1px solid #262626;padding:16px 24px;text-align:center;">
        <p style="margin:0;color:#525252;font-size:12px;">
          이 메일은 뉴스레터 구독자에게 발송됩니다.
          <a href="${unsubscribeUrl}" style="color:#737373;text-decoration:underline;">구독 취소</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim(),
  })
}
