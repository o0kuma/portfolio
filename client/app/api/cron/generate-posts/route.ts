/**
 * /api/cron/generate-posts
 *
 * Vercel Cron Job endpoint — called daily at 00:00 UTC (09:00 KST).
 * Generates 1 blog post per run (Vercel Hobby: 1 cron/day, maxDuration 60s).
 * This endpoint does not prune existing posts; the current schema has no durable
 * marker that distinguishes generated posts from manually authored posts.
 *
 * Uses the same verified approach as server/scripts/auto-generate-posts.js:
 *   - callGeminiRaw: native generateContent endpoint (avoids OpenAI-compat 404 issues)
 *   - 2-step generation: meta (title+tags) via JSON mode, content via plain text
 *   - fixJsonControlChars: handles Gemini quirk with literal control chars in JSON strings
 *
 * Requires CRON_SECRET in deployed environments to protect this endpoint.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel Hobby plan max: 60 seconds

import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/neon-server'
import * as fs from 'fs'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GeneratedPost {
  title: string
  content: string
  tags: string[]
  category: string
}

// ---------------------------------------------------------------------------
// Load Gemini API key (same strategy as ai/chat/route.ts)
// ---------------------------------------------------------------------------
function loadServerEnvIfDev() {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return

  try {
    const serverEnvPath = path.join(process.cwd(), '..', 'server', '.env')
    if (!fs.existsSync(serverEnvPath)) return

    const lines = fs.readFileSync(serverEnvPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const match = trimmed.match(/^([^=:#]+)=(.*)$/)
      if (!match) continue
      const key = match[1].trim()
      const val = match[2].trim().replace(/^["']|["']$/g, '')
      if (key === 'GEMINI_API_KEY' && val && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = val
      }
      if (key === 'DATABASE_URL' && val && !process.env.DATABASE_URL) {
        process.env.DATABASE_URL = val
      }
    }
  } catch {
    // Non-fatal
  }
}

function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim()
  return key && key.length >= 10 ? key : null
}

// ---------------------------------------------------------------------------
// Category config (rotates daily)
// ---------------------------------------------------------------------------
const DAILY_SCHEDULE = [
  { category: 'tech',    topic: '최신 AI 개발 도구와 개발자 워크플로우 혁신' },
  { category: 'economy', topic: '글로벌 주식 시장 동향과 개인 투자 전략' },
  { category: 'coin',    topic: '암호화폐 시장 최신 동향과 블록체인 트렌드' },
  { category: 'travel',  topic: '개발자를 위한 워케이션 추천 및 해외 여행 팁' },
  { category: 'general', topic: '개발자 생산성과 커리어 성장 전략' },
]

const CATEGORY_LABELS: Record<string, string> = {
  tech: '기술',
  economy: '경제',
  coin: '코인',
  travel: '여행',
  general: '일반',
}

// ---------------------------------------------------------------------------
// Gemini native REST helper (avoids OpenAI-compat endpoint 404 issues)
// ---------------------------------------------------------------------------
const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

/** Fix literal control characters inside JSON string values (Gemini quirk). */
function fixJsonControlChars(str: string): string {
  let inString = false
  let escaped = false
  let result = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (escaped) { result += ch; escaped = false; continue }
    if (ch === '\\' && inString) { escaped = true; result += ch; continue }
    if (ch === '"') { inString = !inString; result += ch; continue }
    if (inString) {
      const cc = ch.charCodeAt(0)
      if (ch === '\n') { result += '\\n'; continue }
      if (ch === '\r') { result += '\\r'; continue }
      if (ch === '\t') { result += '\\t'; continue }
      if (cc < 32) continue
    }
    result += ch
  }
  return result
}

async function callGeminiRaw(apiKey: string, prompt: string, jsonMode = false): Promise<string> {
  const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 8192,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Gemini API ${res.status} ${res.statusText}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  return (data.candidates?.[0]?.content?.parts?.[0]?.text as string) ?? ''
}

// ---------------------------------------------------------------------------
// Generate a single post (2-step: meta JSON → content plain text)
// ---------------------------------------------------------------------------
async function generatePost(apiKey: string, category: string, topicHint: string): Promise<GeneratedPost> {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const categoryLabel = CATEGORY_LABELS[category] ?? category

  // Step 1: title + tags as JSON (small, fast)
  const metaPrompt = `당신은 한국어 블로그 포스터입니다.
카테고리: ${categoryLabel}
주제 방향: ${topicHint}
오늘 날짜: ${today}

다음 JSON만 출력하세요 (다른 텍스트 없이):
{"title":"흥미롭고 구체적인 한국어 제목","tags":["태그1","태그2","태그3","태그4"]}`

  const metaRaw = await callGeminiRaw(apiKey, metaPrompt, true)
  const metaFi = metaRaw.indexOf('{')
  const metaLi = metaRaw.lastIndexOf('}')
  if (metaFi === -1 || metaLi === -1) throw new Error(`메타 JSON 없음: ${metaRaw.slice(0, 100)}`)

  let meta: { title?: string; tags?: unknown[] }
  try {
    meta = JSON.parse(fixJsonControlChars(metaRaw.slice(metaFi, metaLi + 1)))
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`메타 JSON 파싱 실패: ${msg}`)
  }

  const title = String(meta.title || topicHint).trim()
  const tags = Array.isArray(meta.tags) ? (meta.tags as unknown[]).slice(0, 5).map(String) : []

  // Step 2: full content as plain markdown (no JSON encoding overhead)
  const contentPrompt = `당신은 전문 한국어 IT/테크 블로거입니다.

아래 제목으로 고품질 한국어 블로그 포스트 본문만 마크다운으로 작성해 주세요.
제목: ${title}
카테고리: ${categoryLabel}
오늘 날짜: ${today}

요구사항:
- 최소 1000자 이상
- ## 소제목으로 구조화
- 실용적인 정보, 인사이트 포함
- 서론/본론/결론 구조
- 제목 없이 본문만 출력`

  const content = await callGeminiRaw(apiKey, contentPrompt, false)
  if (!content || content.length < 200) {
    throw new Error(`본문 너무 짧음: ${content.length}자`)
  }

  return {
    title,
    content: content.trim(),
    tags,
    category,
  }
}

// ---------------------------------------------------------------------------
// Duplicate check
// ---------------------------------------------------------------------------
async function isDuplicate(title: string): Promise<boolean> {
  const prefix = title.substring(0, 25)
  try {
    const r = await dbQuery(
      `SELECT id FROM posts
       WHERE created_at > NOW() - INTERVAL '30 days'
         AND similarity(lower(title), lower($1)) > 0.55
       LIMIT 1`,
      [title]
    )
    return r.rows.length > 0
  } catch {
    const r = await dbQuery(
      `SELECT id FROM posts
       WHERE created_at > NOW() - INTERVAL '30 days'
         AND title ILIKE $1
       LIMIT 1`,
      [`%${prefix}%`]
    )
    return r.rows.length > 0
  }
}

// ---------------------------------------------------------------------------
// Save post to DB
// ---------------------------------------------------------------------------
async function savePost(post: GeneratedPost): Promise<{ id: string; title: string }> {
  const r = await dbQuery(
    `INSERT INTO posts (title, content, author, category, tags, featured, views, likes, status)
     VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9)
     RETURNING id, title`,
    [post.title, post.content, 'iykyk', post.category, post.tags, false, 0, 0, 'published']
  )
  return r.rows[0]
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  loadServerEnvIfDev()

  // Authorization check — Vercel injects the bearer token automatically for cron jobs.
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    console.error('CRON_SECRET is required for /api/cron/generate-posts in deployed environments.')
    return NextResponse.json({ error: 'Cron endpoint is not configured' }, { status: 503 })
  }

  if (cronSecret) {
    const authHeader = req.headers.get('authorization')
    const providedSecret = authHeader?.replace(/^Bearer\s+/i, '').trim()
    if (providedSecret !== cronSecret) {
      console.error('[cron/generate-posts] Unauthorized — CRON_SECRET mismatch or missing Authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    console.error('[cron/generate-posts] DATABASE_URL is not set')
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })
  }

  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    console.error('[cron/generate-posts] GEMINI_API_KEY is not set or too short')
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  // One category per day (rotate by day of year) — fits Hobby cron + 60s timeout
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const startIdx = dayOfYear % DAILY_SCHEDULE.length
  const selected = [DAILY_SCHEDULE[startIdx % DAILY_SCHEDULE.length]]

  const results: { title: string; category: string; id: string }[] = []
  const errors: { category: string; error: string }[] = []

  for (const { category, topic } of selected) {
    try {
      const post = await generatePost(apiKey, category, topic)

      const dup = await isDuplicate(post.title)
      if (dup) {
        errors.push({ category, error: '중복 제목 — 스킵' })
        continue
      }

      const saved = await savePost(post)
      results.push({ title: saved.title, category, id: saved.id })

      // Throttle between calls to respect rate limits
      await new Promise((r) => setTimeout(r, 2000))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[cron/generate-posts] category=${category} failed:`, msg)
      errors.push({ category, error: msg })
    }
  }

  const payload = {
    ok: results.length > 0,
    generated: results.length,
    posts: results,
    errors,
    scheduleIndex: startIdx,
    timestamp: new Date().toISOString(),
  }

  if (results.length === 0) {
    console.error('[cron/generate-posts] No posts generated:', JSON.stringify(errors))
    return NextResponse.json(payload, { status: errors.length > 0 ? 502 : 500 })
  }

  console.log('[cron/generate-posts] Success:', JSON.stringify(results.map((p) => p.title)))
  return NextResponse.json(payload)
}
