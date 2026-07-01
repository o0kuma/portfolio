'use client'

const KEY = 'arcade_coins'

export function getCoins(): number {
  try {
    return Number(localStorage.getItem(KEY) ?? '0') || 0
  } catch {
    return 0
  }
}

export function addCoins(amount: number): number {
  const next = getCoins() + Math.max(0, amount)
  try {
    localStorage.setItem(KEY, String(next))
  } catch {}
  return next
}

const BEST_PREFIX = 'arcade_best_'

export function getBestScore(gameId: string): number {
  try {
    return Number(localStorage.getItem(BEST_PREFIX + gameId) ?? '0') || 0
  } catch {
    return 0
  }
}

export function setBestScore(gameId: string, score: number): { best: number; isNew: boolean } {
  const current = getBestScore(gameId)
  if (score > current) {
    try {
      localStorage.setItem(BEST_PREFIX + gameId, String(score))
    } catch {}
    return { best: score, isNew: true }
  }
  return { best: current, isNew: false }
}
