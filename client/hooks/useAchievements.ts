'use client'

import { useState, useCallback } from 'react'
import {
  ACHIEVEMENTS,
  checkAchievements,
  loadUnlockedAchievements,
  saveUnlockedAchievements,
} from '@/lib/tower-defense/achievements'
import type { AchievementId, Achievement, AchievementCheckInput } from '@/lib/tower-defense/achievements'

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(() => loadUnlockedAchievements())
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([])

  const checkAndUpdate = useCallback(
    (input: AchievementCheckInput) => {
      setUnlocked((prev) => {
        const newIds = checkAchievements(input, prev)
        if (newIds.length === 0) return prev
        const next = new Set(prev)
        for (const id of newIds) next.add(id)
        saveUnlockedAchievements(next)
        const newAchObjs = ACHIEVEMENTS.filter((a) => newIds.includes(a.id))
        setNewlyUnlocked((q) => [...q, ...newAchObjs])
        return next
      })
    },
    [],
  )

  const clearNew = useCallback(() => {
    setNewlyUnlocked([])
  }, [])

  return { unlocked, newlyUnlocked, checkAndUpdate, clearNew }
}
