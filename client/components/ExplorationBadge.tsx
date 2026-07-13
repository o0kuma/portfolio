'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { LANDMARKS, getVisited, markVisited, pathToLandmark } from '@/lib/exploration'
import { markEarned, ACHIEVEMENTS } from '@/lib/achievements'
import AchievementToast from '@/components/AchievementToast'
import type { Achievement } from '@/lib/achievements'

const SECTION_IDS = ['about', 'skills', 'projects', 'contact']

/**
 * "Exploration progress" — tracks which parts of the site a visitor has
 * seen (page-level landmarks by route, plus the four portfolio in-page
 * sections) and shows a small ring badge with the running total. Reaching
 * 100% unlocks the "site_explorer" achievement via the existing
 * achievements system, so it also shows up on /achievements.
 */
export default function ExplorationBadge() {
  const pathname = usePathname()
  const { locale } = useLanguage()
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setVisited(getVisited())
  }, [])

  useEffect(() => {
    const key = pathToLandmark(pathname)
    if (key && markVisited(key)) {
      setVisited(getVisited())
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
  const pct = Math.round((count / total) * 100)

  useEffect(() => {
    if (count === total && total > 0) {
      const wasNew = markEarned('site_explorer')
      if (wasNew) {
        const ach = ACHIEVEMENTS.find((a) => a.id === 'site_explorer')
        if (ach) setNewAchievements((prev) => [...prev, ach])
      }
    }
  }, [count, total])

  const r = 15
  const circumference = 2 * Math.PI * r

  return (
    <>
      <AchievementToast achievements={newAchievements} onDone={() => setNewAchievements([])} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={locale === 'en' ? `Exploration progress: ${pct}%` : `탐험 진행도: ${pct}%`}
        title={locale === 'en' ? `Exploration progress: ${pct}%` : `탐험 진행도: ${pct}%`}
        style={{ position: 'fixed', bottom: '128px', left: '24px', zIndex: 10001 }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/70 hover:text-white transition-colors"
      >
        <svg width="30" height="30" viewBox="0 0 34 34">
          <circle cx="17" cy="17" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
          <circle
            cx="17"
            cy="17"
            r={r}
            fill="none"
            stroke={pct === 100 ? '#eda100' : '#2a78d6'}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (pct / 100) * circumference}
            strokeLinecap="round"
            transform="rotate(-90 17 17)"
            style={{ transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.4s ease-out' }}
          />
          <text x="17" y="19" textAnchor="middle" fontSize="9" fill="white" fontFamily="monospace">
            {pct}
          </text>
        </svg>
      </button>

      {open && (
        <div
          style={{ position: 'fixed', bottom: '128px', left: '68px', zIndex: 10001 }}
          className="w-56 rounded-xl border border-white/15 bg-black/90 p-3 font-mono text-xs backdrop-blur-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-white/80">{locale === 'en' ? 'Exploration' : '탐험 진행도'}</span>
            <span className="text-white/50">{count}/{total}</span>
          </div>
          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#eda100' : '#2a78d6' }}
            />
          </div>
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {LANDMARKS.map((l) => {
              const done = visited.has(l.key)
              return (
                <li key={l.key} className={`flex items-center gap-1.5 ${done ? 'text-white/70' : 'text-white/30'}`}>
                  <span>{done ? '✓' : '·'}</span>
                  <span>{locale === 'en' ? l.labelEn : l.labelKo}</span>
                </li>
              )
            })}
          </ul>
          <AnimatePresence>
            {pct === 100 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-2 text-amber-400"
              >
                {locale === 'en' ? '🎉 You explored the whole site!' : '🎉 사이트를 전부 둘러보셨어요!'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}
