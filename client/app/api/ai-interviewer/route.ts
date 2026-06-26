export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }],
    })

    const reply = msg.content[0].type === 'text' ? msg.content[0].text : '응답을 생성하지 못했습니다.'
    return NextResponse.json({ reply })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/api/ai-interviewer POST]', msg)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
