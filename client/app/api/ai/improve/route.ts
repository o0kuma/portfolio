export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash-preview-05-20'

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

const improvementInstructions: Record<string, string> = {
  general: '문장을 더 자연스럽고 명확하게 개선하세요.',
  grammar: '문법과 맞춤법 오류를 수정하고 문장을 자연스럽게 만드세요.',
  formal: '더 공식적이고 격식 있는 표현으로 바꿔주세요.',
  casual: '더 친근하고 편안한 표현으로 바꿔주세요.',
  concise: '불필요한 부분을 제거하고 핵심만 남겨 간결하게 만드세요.'
}

export async function POST(request: Request) {
  try {
    const { text, improvementType = 'general' } = await request.json()

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ success: false, error: '개선할 텍스트가 필요합니다.' }, { status: 400 })
    }

    const originalText = text.trim()
    const instruction = improvementInstructions[improvementType] || improvementInstructions.general

    if (!process.env.GEMINI_API_KEY) loadServerEnv()
    const geminiApiKey = getGeminiApiKey()

    if (!geminiApiKey) {
      return NextResponse.json({
        success: true,
        originalText,
        improvedText: originalText,
        improvementType
      })
    }

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
            content: `당신은 한국어 텍스트 개선 전문가입니다. ${instruction} 원문의 의미는 유지하면서 표현만 개선하세요. 개선된 텍스트만 출력하고 설명은 하지 마세요.`
          },
          { role: 'user', content: originalText }
        ],
        temperature: 0.6,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      return NextResponse.json({ success: true, originalText, improvedText: originalText, improvementType })
    }

    const data = await response.json()
    const improvedText = data.choices?.[0]?.message?.content || originalText

    return NextResponse.json({ success: true, originalText, improvedText, improvementType })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || '텍스트 개선 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
