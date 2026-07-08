export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'

// Simple in-memory rate limiter: IP -> array of timestamps
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 3

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => t > windowStart)
  if (timestamps.length >= RATE_LIMIT_MAX) return false
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return true
}

async function ensureTable() {
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS rpg_wall_notes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(30) NOT NULL,
      message VARCHAR(120) NOT NULL,
      emoji VARCHAR(10) DEFAULT '📌',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function GET() {
  try {
    await ensureTable()
    const result = await dbQuery(
      `SELECT id, name, message, emoji, created_at FROM rpg_wall_notes ORDER BY created_at DESC LIMIT 40`
    )
    return NextResponse.json({ notes: result.rows })
  } catch (err) {
    console.error('RPG wall GET error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

const ALLOWED_EMOJIS = ['📌', '👋', '🎉', '😊', '🔥', '💻', '✨', '🚀', '❤️', '🐾']

export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: '1시간에 최대 3개의 쪽지만 남길 수 있습니다.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const name: string = (body?.name ?? '').trim()
    const message: string = (body?.message ?? '').trim()
    const emoji: string = body?.emoji ?? '📌'

    if (name.length < 1 || name.length > 20) {
      return NextResponse.json({ error: '이름은 1~20자 사이여야 합니다.' }, { status: 400 })
    }
    if (message.length < 1 || message.length > 120) {
      return NextResponse.json({ error: '쪽지는 1~120자 사이여야 합니다.' }, { status: 400 })
    }
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: '유효하지 않은 이모지입니다.' }, { status: 400 })
    }

    await ensureTable()
    const result = await dbQuery(
      `INSERT INTO rpg_wall_notes (name, message, emoji) VALUES ($1, $2, $3) RETURNING id, name, message, emoji, created_at`,
      [name, message, emoji]
    )

    return NextResponse.json({ note: result.rows[0] }, { status: 201 })
  } catch (err) {
    console.error('RPG wall POST error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
