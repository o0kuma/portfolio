export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import {
  applyQuotaCookieToResponse,
  checkAiQuota,
  isQuotaCheckFailure,
  isUsageRecordFailure,
  recordAiUsage,
} from '@/lib/ai-quota'

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
      path.join(serverDir, '.env.example')
    ]
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8')
        envFile.split('\n').forEach(line => {
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
  } catch {}
}

loadServerEnv()

export async function POST(request: Request) {
  try {
    const { text, summaryLength = 'medium' } = await request.json()

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ success: false, error: '요약할 텍스트가 필요합니다.' }, { status: 400 })
    }

    const originalText = text.trim()

    if (!process.env.GEMINI_API_KEY) loadServerEnv()
    const geminiApiKey = getGeminiApiKey()

    const lengthInstruction =
      summaryLength === 'short'
        ? '1~2문장으로 매우 간결하게 요약하세요.'
        : summaryLength === 'long'
        ? '5~7문장으로 자세하게 요약하세요.'
        : '3~5문장으로 요약하세요.'

    if (!geminiApiKey) {
      const fallback = originalText.length > 100
        ? originalText.slice(0, 100) + '...'
        : originalText
      return NextResponse.json({
        success: true,
        originalText,
        summary: `[요약] ${fallback}`,
        summaryLength
      })
    }

    const quotaCheck = await checkAiQuota(request, 'summarize')
    if (isQuotaCheckFailure(quotaCheck)) {
      return quotaCheck.response
    }
    const { quotaIdentity } = quotaCheck

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${geminiApiKey}`
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages: [
          {
            role: 'system',
            content: `당신은 텍스트 요약 전문가입니다. 주어진 텍스트를 한국어로 ${lengthInstruction} 핵심 내용만 포함하세요.`
          },
          { role: 'user', content: `다음 텍스트를 요약해주세요:\n\n${originalText}` }
        ],
        temperature: 0.5,
        max_tokens: 300
      })
    })

    let summary = '[요약 실패]'
    if (response.ok) {
      const data = await response.json()
      summary = data.choices?.[0]?.message?.content || '[요약 실패]'
    } else {
      const fallback = originalText.length > 100 ? originalText.slice(0, 100) + '...' : originalText
      summary = `[요약] ${fallback}`
    }

    const usageRecord = await recordAiUsage(request, 'summarize', quotaIdentity, summary.length)
    if (isUsageRecordFailure(usageRecord)) {
      return usageRecord.response
    }

    return applyQuotaCookieToResponse(
      NextResponse.json({ success: true, originalText, summary, summaryLength }),
      quotaIdentity,
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || '요약 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
