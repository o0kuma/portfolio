export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { applyAnonymousQuotaCookie, getAnonymousQuotaIdentity } from '@/lib/anonymous-quota'
import { checkAnonymousChatQuota, recordAnonymousUsage } from '@/lib/ai-chat-quota'

const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'

function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (key && key.length >= 10) return key
  return null
}

function loadServerEnv() {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return
  try {
    const serverDir = path.join(process.cwd(), '..', 'server')
    const envPaths = [
      path.join(serverDir, '.env'),
      path.join(serverDir, 'env.example'),
      path.join(serverDir, '.env.example'),
    ]
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8')
        envFile.split('\n').forEach((line) => {
          const trimmedLine = line.trim()
          if (trimmedLine && !trimmedLine.startsWith('#')) {
            const match = trimmedLine.match(/^([^=:#]+)=(.*)$/)
            if (match) {
              const key = match[1].trim()
              const value = match[2].trim().replace(/^["']|["']$/g, '')
              if (key === 'GEMINI_API_KEY' && value && !process.env.GEMINI_API_KEY) {
                process.env.GEMINI_API_KEY = value
              }
            }
          }
        })
        if (process.env.GEMINI_API_KEY) break
      }
    }
  } catch {
    // non-fatal in dev
  }
}

loadServerEnv()

function estimateTokensUsed(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4))
}

export async function POST(request: Request) {
  try {
    const { text, targetLanguage = 'English' } = await request.json()

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ success: false, error: '번역할 텍스트가 필요합니다.' }, { status: 400 })
    }

    const originalText = text.trim()
    const target =
      typeof targetLanguage === 'string' && targetLanguage.trim()
        ? targetLanguage.trim()
        : 'English'

    if (!process.env.GEMINI_API_KEY) loadServerEnv()
    const geminiApiKey = getGeminiApiKey()

    if (!geminiApiKey) {
      return NextResponse.json({
        success: true,
        originalText,
        translatedText: originalText,
        targetLanguage: target,
      })
    }

    const quotaIdentity = getAnonymousQuotaIdentity(request)
    const quotaJson = (body: unknown, init?: ResponseInit) =>
      applyAnonymousQuotaCookie(NextResponse.json(body, init), quotaIdentity)

    const quota = await checkAnonymousChatQuota(quotaIdentity.sessionId)
    if (!quota.ok) {
      return quotaJson(
        {
          success: false,
          error: '사용량 한도를 확인할 수 없어 AI 응답을 생성할 수 없습니다.',
          errorCode: 'SUBSCRIPTION_CHECK_UNAVAILABLE',
        },
        { status: 503 },
      )
    }
    if (quota.exceeded) {
      return quotaJson(
        {
          success: false,
          error: '일일 무료 사용 한도를 초과했습니다.',
          errorCode: 'DAILY_LIMIT_EXCEEDED',
          limit: quota.limit,
          used: quota.used,
          upgradeRequired: true,
        },
        { status: 403 },
      )
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${geminiApiKey}`,
        },
        body: JSON.stringify({
          model: GEMINI_MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the user's text into ${target}. Preserve meaning and tone. Output only the translation with no explanation.`,
            },
            { role: 'user', content: originalText },
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
      },
    )

    let translatedText = originalText
    if (response.ok) {
      const data = await response.json()
      translatedText = data.choices?.[0]?.message?.content?.trim() || originalText
    }

    const usageRecorded = await recordAnonymousUsage(
      quotaIdentity.sessionId,
      'translate',
      1,
      estimateTokensUsed(translatedText),
    )
    if (!usageRecorded) {
      return quotaJson(
        {
          success: false,
          error: '사용량을 기록할 수 없어 AI 응답을 완료할 수 없습니다.',
          errorCode: 'USAGE_RECORD_UNAVAILABLE',
        },
        { status: 503 },
      )
    }

    return quotaJson({
      success: true,
      originalText,
      translatedText,
      targetLanguage: target,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '번역 중 오류가 발생했습니다.'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
