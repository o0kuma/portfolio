export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { recordAiRequest } from '@/lib/aiStats'

const SYSTEM_PROMPT = `You are an AI interviewer assistant for okuma(Seungil Oh)'s portfolio.
About: 프론트엔드 개발자 겸 웹퍼블리셔, 1990년생, 개발경력 7년+.
Career:
- 퀀텀에이아이(Quantum AI), 2025.12 ~ 현재, 프론트엔드 개발
- (주)소프트위즈, 2020.05 ~ 2025.12, 웹팀/대리 — Next.js 브랜드 사이트, Svelte+Web Components CRM, PixiJS 트레이딩 UI, MySQL 사내 시스템
- 스마일데이, 2018.12 ~ 2020.02, 웹개발팀/사원 — 에이전시 외주 퍼블리싱, jQuery 인터랙션
Skills: 주력은 프론트엔드(HTML5/CSS3, JavaScript, TypeScript, React, Next.js, Svelte, PixiJS). 백엔드도 Go/Java/Node.js로 서버·API 개발 가능. 퍼블리싱(HTML/CSS 반응형)도 능숙. MySQL, Figma.
Projects: BABA OPTION(Next.js 브랜드 사이트), CRM(Svelte+Web Components), babaoption WTS(PixiJS), mytradinginfo(React), mysoftwiz(EJS), 랄라(React 유아 AI 앱), kmuseum(박물관 예약).
강점: 퍼블리싱은 누구보다 자신 있으며, 반응형 UI와 상태 기반 인터랙션 구현에 능숙합니다.
Answer questions about hiring, skills, projects, or collaboration in Korean unless asked in English.
Keep answers concise (2-3 sentences max). Do not invent facts not listed here.`

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
  choices?: Array<{ message?: { content?: string } }>
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
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: question },
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      console.error('[/api/ai-interviewer] Gemini error:', res.status, errBody)
      return NextResponse.json({ message: `API 오류 (${res.status})` }, { status: 502 })
    }

    const data = await res.json() as GeminiResponse
    const reply = data.choices?.[0]?.message?.content ?? '응답을 생성하지 못했습니다.'
    recordAiRequest()
    return NextResponse.json({ reply })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/ai-interviewer POST]', msg)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
