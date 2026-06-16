import { HIGH_SCORE_KEY, type SurviveBest } from './constants'

export function readBest(): SurviveBest {
  if (typeof window === 'undefined') return { timeSec: 0, level: 1, kills: 0 }
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_KEY)
    if (!raw) return { timeSec: 0, level: 1, kills: 0 }
    const parsed = JSON.parse(raw) as Partial<SurviveBest>
    return {
      timeSec: Number(parsed.timeSec) || 0,
      level: Number(parsed.level) || 1,
      kills: Number(parsed.kills) || 0,
    }
  } catch {
    return { timeSec: 0, level: 1, kills: 0 }
  }
}

/** Persist a run if it beats the stored best time. Returns the resulting best. */
export function maybePersistBest(run: SurviveBest): SurviveBest {
  const prev = readBest()
  if (run.timeSec <= prev.timeSec) return prev
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(run))
    } catch {
      /* ignore quota errors */
    }
  }
  return run
}

export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
