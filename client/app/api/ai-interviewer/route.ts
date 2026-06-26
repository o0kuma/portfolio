export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an AI interviewer assistant for Seungil Oh's portfolio.
Seungil is a full-stack developer specializing in Next.js, React, Three.js, TypeScript, and game development.
Projects: 3D interactive portfolio, Tower Defense game, Survive top-down shooter, AI Blog with Gemini API, Typing Speed game, Food Map with Notion API.
Skills: Frontend (95%), Backend (75%), UI/UX (80%), DevOps (60%), Game Dev (70%), Database (72%).
Answer questions about hiring, skills, projects, or collaboration in Korean unless asked in English.
Keep answers concise (2-3 sentences max).`

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ message: '요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요.' }, { status: 429 })
    }

    const body = await request.json() as { question: string }
    const { question } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ message: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
        }),
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      console.error('[/api/ai-interviewer] Gemini error:', res.status, errBody)
      return NextResponse.json({ message: `API 오류 (${res.status})` }, { status: 502 })
    }

    const data = await res.json() as GeminiResponse
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '응답을 생성하지 못했습니다.'
    return NextResponse.json({ reply })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/ai-interviewer POST]', msg)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
