import { TD_SESSION_ID_KEY, TD_PLAYER_NAME_KEY } from './constants'

function randomSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 32)
  }
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateTowerDefenseSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.sessionStorage.getItem(TD_SESSION_ID_KEY)
  if (!id) {
    id = randomSessionId()
    window.sessionStorage.setItem(TD_SESSION_ID_KEY, id)
  }
  return id
}

export function readTowerDefensePlayerName(): string {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage.getItem(TD_PLAYER_NAME_KEY) ?? ''
}

export function writeTowerDefensePlayerName(name: string): void {
  if (typeof window === 'undefined') return
  const trimmed = name.trim()
  if (trimmed) {
    window.sessionStorage.setItem(TD_PLAYER_NAME_KEY, trimmed.slice(0, 20))
  } else {
    window.sessionStorage.removeItem(TD_PLAYER_NAME_KEY)
  }
}

export type SubmitTowerDefenseScoreInput = {
  wave: number
  kills: number
  playerName?: string
}

export async function submitTowerDefenseScore(
  input: SubmitTowerDefenseScoreInput,
): Promise<{ ok: boolean; error?: string }> {
  if (input.wave <= 0) return { ok: false }

  const playerName = input.playerName?.trim() || readTowerDefensePlayerName()
  const sessionId = getOrCreateTowerDefenseSessionId()

  try {
    const res = await fetch('/api/tower-defense/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: playerName || undefined,
        wave: input.wave,
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

export type TowerDefenseLeaderboardEntry = {
  rank: number
  playerName: string
  wave: number
  kills: number
  createdAt: string
}

export async function fetchTowerDefenseLeaderboard(
  limit = 20,
): Promise<{ scores: TowerDefenseLeaderboardEntry[]; error?: string }> {
  try {
    const res = await fetch(`/api/tower-defense/scores?limit=${limit}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      return { scores: [], error: data.message ?? res.statusText }
    }
    const data = (await res.json()) as { scores: TowerDefenseLeaderboardEntry[] }
    return { scores: data.scores ?? [] }
  } catch {
    return { scores: [], error: '네트워크 오류' }
  }
}
