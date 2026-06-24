export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'

const SYSTEM_PROMPT = `당신은 '쿠마'입니다. 한국인 프론트엔드 개발자 오승일(kuuuma)의 포트폴리오 사이트에 있는 AI 동반자예요.
마우스 커서를 따라다니며 방문자와 대화합니다.

개발자 정보:
- 이름: 오승일 (kuuuma)
- 전문: React, Next.js, TypeScript 기반 프론트엔드/풀스택 개발
- 프로젝트: 테트리스, 서바이브, 타워 디펜스 게임 직접 개발
- Notion으로 맛집 리스트 관리하는 /food 페이지 운영
- 기술 블로그 운영 중 (/posts)
- 연락: 사이트 내 Contact 폼

성격: 친근하고 유머 있게, 짧고 명확하게 답변. 한국어로 대화. 모르는 건 Contact 페이지 안내.`

const rateMap = new Map<string, { count: number; reset: number }>()

function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 3_600_000 })
    return true
  }
  if (entry.count >= 30) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRate(ip)) {
    return NextResponse.json({ reply: '잠깐, 너무 많이 물어보셨어요! 1시간 후에 다시 해주세요 😅' }, { status: 429 })
  }

  try {
    const { message, history = [] } = await req.json() as {
      message: string
      history?: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!message?.trim()) {
      return NextResponse.json({ reply: '메시지를 입력해주세요!' })
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json({ reply: 'AI 기능이 설정되지 않았어요. Contact 페이지로 연락해주세요!' })
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: message.trim().slice(0, 1000) },
    ]

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages,
        temperature: 0.8,
        max_tokens: 400,
      }),
    })

    if (!res.ok) {
      console.error('[kuuma/chat] Gemini error', res.status, await res.text())
      return NextResponse.json({ reply: '잠깐 문제가 생겼어요. 잠시 후 다시 시도해주세요!' })
    }

    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const reply = data.choices?.[0]?.message?.content?.trim() || '응답을 받지 못했어요.'
    return NextResponse.json({ reply })
  } catch (e) {
    console.error('[kuuma/chat]', e)
    return NextResponse.json({ reply: '잠깐 문제가 생겼어요. 잠시 후 다시 시도해주세요!' })
  }
}
