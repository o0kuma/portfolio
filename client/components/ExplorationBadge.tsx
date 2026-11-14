'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { LANDMARKS, getVisited, markVisited, pathToLandmark } from '@/lib/exploration'
import { markEarned, ACHIEVEMENTS } from '@/lib/achievements'
import AchievementToast from '@/components/AchievementToast'
import type { Achievement } from '@/lib/achievements'

const SECTION_IDS = ['about', 'skills', 'projects', 'contact']

const UPDATE_EVENT = 'exploration:update'

/**
 * "Exploration progress" — tracks which parts of the site a visitor has
 * seen (page-level landmarks by route, plus the four portfolio in-page
 * sections). Reaching 100% unlocks the "site_explorer" achievement, so it
 * also shows up on /achievements. The running total is shown by
 * <ExplorationStatus/> in the footer's settings row; this component renders
 * nothing but the achievement toast.
 */
export default function ExplorationBadge() {
  const pathname = usePathname()
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setVisited(getVisited())
  }, [])

  useEffect(() => {
    const key = pathToLandmark(pathname)
    if (key && markVisited(key)) {
      setVisited(getVisited())
      window.dispatchEvent(new Event(UPDATE_EVENT))
    }
  }, [pathname])

  // Track the four in-page portfolio sections while on /portfolio.
  useEffect(() => {
    if (!pathname.startsWith('/portfolio')) return
    const observers: IntersectionObserver[] = []
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && markVisited(id)) {
            setVisited(getVisited())
            window.dispatchEvent(new Event(UPDATE_EVENT))
          }
        },
        { threshold: 0.4 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [pathname])

  const total = LANDMARKS.length
  const count = LANDMARKS.filter((l) => visited.has(l.key)).length

  useEffect(() => {
    if (count === total && total > 0) {
      const wasNew = markEarned('site_explorer')
      if (wasNew) {
        const ach = ACHIEVEMENTS.find((a) => a.id === 'site_explorer')
        if (ach) setNewAchievements((prev) => [...prev, ach])
      }
    }
  }, [count, total])

  return <AchievementToast achievements={newAchievements} onDone={() => setNewAchievements([])} />
}

/** Footer item: "탐험 3/11", opens the checklist above it. */
export function ExplorationStatus() {
  const { locale } = useLanguage()
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sync = () => setVisited(getVisited())
    sync()
    window.addEventListener(UPDATE_EVENT, sync)
    return () => window.removeEventListener(UPDATE_EVENT, sync)
  }, [])

  const total = LANDMARKS.length
  const count = LANDMARKS.filter((l) => visited.has(l.key)).length

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="rounded-md border border-line px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        {locale === 'en' ? 'Explored' : '탐험'} {count}/{total}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-xl border border-line bg-panel p-3 text-xs shadow-lg shadow-black/40">
          <p className="mb-2 text-fg-muted">
            {locale === 'en' ? 'Sections visited' : '둘러본 곳'} {count}/{total}
          </p>
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {LANDMARKS.map((l) => {
              const done = visited.has(l.key)
              return (
                <li key={l.key} className={done ? 'text-fg' : 'text-fg-subtle'}>
                  {done ? '✓ ' : '· '}
                  {locale === 'en' ? l.labelEn : l.labelKo}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
