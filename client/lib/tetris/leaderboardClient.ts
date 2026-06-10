import {
  TETRIS_PLAYER_NAME_KEY,
  TETRIS_SESSION_ID_KEY,
} from '@/lib/tetris/constants'

function randomSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 32)
  }
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateTetrisSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.sessionStorage.getItem(TETRIS_SESSION_ID_KEY)
  if (!id) {
    id = randomSessionId()
    window.sessionStorage.setItem(TETRIS_SESSION_ID_KEY, id)
  }
  return id
}

export function readTetrisPlayerName(): string {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage.getItem(TETRIS_PLAYER_NAME_KEY) ?? ''
}

export function writeTetrisPlayerName(name: string): void {
  if (typeof window === 'undefined') return
  const trimmed = name.trim()
  if (trimmed) {
    window.sessionStorage.setItem(TETRIS_PLAYER_NAME_KEY, trimmed.slice(0, 20))
  } else {
    window.sessionStorage.removeItem(TETRIS_PLAYER_NAME_KEY)
  }
}

export type SubmitTetrisScoreInput = {
  score: number
  lines: number
  level: number
  playerName?: string
}

export async function submitTetrisScore(
  input: SubmitTetrisScoreInput,
): Promise<{ ok: boolean; error?: string }> {
  if (input.score <= 0) return { ok: false }

  const playerName = input.playerName?.trim() || readTetrisPlayerName()
  const sessionId = getOrCreateTetrisSessionId()

  try {
    const res = await fetch('/api/tetris/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: playerName || undefined,
        score: input.score,
        lines: input.lines,
        level: input.level,
        sessionId,
      }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      return { ok: false, error: data.message ?? res.statusText }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: '네트워크 오류' }
  }
}

export type LeaderboardEntry = {
  rank: number
  playerName: string
  score: number
  lines: number | null
  level: number | null
  createdAt: string
}

export async function fetchTetrisLeaderboard(
  limit = 20,
): Promise<{ scores: LeaderboardEntry[]; error?: string }> {
  try {
    const res = await fetch(`/api/tetris/scores?limit=${limit}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      return { scores: [], error: data.message ?? res.statusText }
    }
    const data = (await res.json()) as { scores: LeaderboardEntry[] }
    return { scores: data.scores ?? [] }
  } catch {
    return { scores: [], error: '네트워크 오류' }
  }
}
