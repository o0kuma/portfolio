import { SURVIVE_SESSION_ID_KEY, SURVIVE_PLAYER_NAME_KEY } from './constants'

function randomSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 32)
  }
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateSurviveSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.sessionStorage.getItem(SURVIVE_SESSION_ID_KEY)
  if (!id) {
    id = randomSessionId()
    window.sessionStorage.setItem(SURVIVE_SESSION_ID_KEY, id)
  }
  return id
}

export function readSurvivePlayerName(): string {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage.getItem(SURVIVE_PLAYER_NAME_KEY) ?? ''
}

export function writeSurvivePlayerName(name: string): void {
  if (typeof window === 'undefined') return
  const trimmed = name.trim()
  if (trimmed) {
    window.sessionStorage.setItem(SURVIVE_PLAYER_NAME_KEY, trimmed.slice(0, 20))
  } else {
    window.sessionStorage.removeItem(SURVIVE_PLAYER_NAME_KEY)
  }
}

export type SubmitSurviveScoreInput = {
  timeSec: number
  level: number
  kills: number
  playerName?: string
}

export async function submitSurviveScore(
  input: SubmitSurviveScoreInput,
): Promise<{ ok: boolean; error?: string }> {
  if (input.timeSec <= 0) return { ok: false }

  const playerName = input.playerName?.trim() || readSurvivePlayerName()
  const sessionId = getOrCreateSurviveSessionId()

  try {
    const res = await fetch('/api/survive/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: playerName || undefined,
        timeSec: input.timeSec,
        level: input.level,
        kills: input.kills,
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

export type SurviveLeaderboardEntry = {
  rank: number
  playerName: string
  timeSec: number
  level: number
  kills: number
  createdAt: string
}

export async function fetchSurviveLeaderboard(
  limit = 20,
): Promise<{ scores: SurviveLeaderboardEntry[]; error?: string }> {
  try {
    const res = await fetch(`/api/survive/scores?limit=${limit}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      return { scores: [], error: data.message ?? res.statusText }
    }
    const data = (await res.json()) as { scores: SurviveLeaderboardEntry[] }
    return { scores: data.scores ?? [] }
  } catch {
    return { scores: [], error: '네트워크 오류' }
  }
}
