export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { recordAiRequest } from '@/lib/aiStats'

let client: Anthropic | null = null
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

// Kept in sync with the AI Interviewer's system prompt
// (app/api/ai-interviewer/route.ts) — that one already tracks the site's
// current career/project/skills content; this used to be a much thinner,
// stale blurb that didn't even know about the current job.
const SYSTEM_PROMPT = `You are a friendly assistant for okuma(Seungil Oh)'s Korean portfolio/blog site.
Answer in Korean unless asked in English. Be concise and friendly.

About: 프론트엔드 개발자 겸 웹퍼블리셔, 1990년생, 개발경력 7년+.
Career:
- 퀀텀에이아이(Quantum AI), 2025.12 ~ 현재, 프론트엔드 개발
- (주)소프트위즈, 2020.05 ~ 2025.12, 웹팀/대리 — Next.js 브랜드 사이트, Svelte+Web Components CRM, PixiJS 트레이딩 UI, MySQL 사내 시스템
- 스마일데이, 2018.12 ~ 2020.02, 웹개발팀/사원 — 에이전시 외주 퍼블리싱, jQuery 인터랙션
Skills: 주력은 프론트엔드(HTML5/CSS3, JavaScript, TypeScript, React, Next.js, Svelte, PixiJS). 백엔드도 Go/Java/Node.js로 서버·API 개발 가능. 퍼블리싱(HTML/CSS 반응형)도 능숙. MySQL, Figma.
Projects: BABA OPTION(Next.js 브랜드 사이트), CRM(Svelte+Web Components), 이지트로스 WTS(PixiJS), mytradinginfo(React), mysoftwiz(EJS), 랄라(React 유아 AI 앱), kmuseum(박물관 예약).
Also on this site: browser games he built himself (Tetris, Tower Defense, Survive, RPG, Pocket Arcade), a Notion-backed food/restaurant tracker, and a tech blog.
Do not invent facts not listed here — if asked about something you don't know, suggest the contact form or the /portfolio page.`

// Simple rate limiter: Map<ip, { count, resetAt }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) {
    return false
  }

  entry.count++
  return true
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: '요청 한도를 초과했습니다. 1시간 후에 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    const body = await request.json() as { messages: ChatMessage[] }
    const { messages } = body

    if (!Array.isArray(messages)) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
    }

    // Keep only last 10 messages
    const recentMessages = messages.slice(-10)

    const msg = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: recentMessages,
    })

    const reply = msg.content[0].type === 'text' ? msg.content[0].text : ''
    recordAiRequest()

    return NextResponse.json({ reply })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/chatbot POST]', msg)
    if (msg.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ reply: '현재 AI 기능이 설정되지 않았습니다. 문의는 Contact 페이지를 이용해주세요.' }, { status: 200 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
