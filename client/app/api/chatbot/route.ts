export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

const SYSTEM_PROMPT = `You are a helpful assistant for a Korean frontend developer's portfolio site.
Answer questions about the developer in Korean. Be friendly and concise.

About the developer:
- Frontend developer specializing in React, Next.js, TypeScript
- Experienced with game development (Tetris, Tower Defense, Survival games)
- Runs a food/restaurant tracking page using Notion
- Writes tech blog posts
- Contact: available through the contact form on the site

If asked about specific personal info you don't know, suggest visiting the resume page or using the contact form.`

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
