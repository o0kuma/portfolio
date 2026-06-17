import { HIGH_SCORE_KEY, type TowerDefenseBest } from './constants'

export function readBest(): TowerDefenseBest {
  if (typeof window === 'undefined') return { wave: 0, kills: 0 }
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_KEY)
    if (!raw) return { wave: 0, kills: 0 }
    const parsed = JSON.parse(raw) as Partial<TowerDefenseBest>
    return {
      wave: Number(parsed.wave) || 0,
      kills: Number(parsed.kills) || 0,
    }
  } catch {
    return { wave: 0, kills: 0 }
  }
}

/** Persist a run if it beats the stored best wave. Returns the resulting best. */
export function maybePersistBest(run: TowerDefenseBest): TowerDefenseBest {
  const prev = readBest()
  if (run.wave <= prev.wave) return prev
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(run))
    } catch {
      /* ignore quota errors */
    }
  }
  return run
}
