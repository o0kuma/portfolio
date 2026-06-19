'use server'

import { z } from 'zod'
import { sendContactEmail } from '@/lib/email'
import { dbQuery } from '@/lib/neon-server'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
})

export async function submitContact(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })
  if (!parsed.success) {
    return { error: '입력을 확인해주세요.' }
  }

  const { name, email, subject, message } = parsed.data

  // DB 저장 (실패해도 이메일 전송 계속 진행)
  let contactId: string | undefined
  let dbError: string | undefined

  try {
    const insertResult = await dbQuery<{ id: string }>(
      `INSERT INTO contacts (name, email, subject, message, status, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, 'unread', $5, $6)
       RETURNING id`,
      [name, email, subject, message, 'server-action', 'server-action'],
    )
    contactId = insertResult.rows[0]?.id
  } catch (err: unknown) {
    dbError = err instanceof Error ? err.message : 'DB 저장 실패'
    console.warn('⚠️ DB 저장 실패 (이메일 전송은 계속 진행):', dbError)
  }

  // 이메일 전송
  let emailSent = false
  const hasEmailConfig =
    process.env.SMTP_USER &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN

  if (hasEmailConfig) {
    try {
      const result = await sendContactEmail({ name, email, subject, message })
      emailSent = !!result.success
    } catch (err: unknown) {
      console.error('이메일 전송 오류:', err)
    }
  }

  if (!contactId && !emailSent) {
    return { error: '메시지를 저장하거나 전송하지 못했습니다. 잠시 후 다시 시도해주세요.' }
  }

  return { success: true, contactId, emailSent }
}
