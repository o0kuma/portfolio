'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useIsNightOwlHours } from '@/lib/useNightOwlHours'
import { useLanguage } from '@/lib/LanguageContext'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const SEEN_KEY = 'nightOwlClubSeenDate'

/**
 * A quiet, once-a-night easter egg for whoever happens to be browsing
 * between 2am and 5am local time — most visitors will never see this.
 * Fires once per calendar day (localStorage-gated by date string) so it
 * doesn't nag someone who's up for hours, and fades on its own — no
 * dismiss button, nothing to interact with.
 */
export default function NightOwlClub() {
  const isNightOwlHours = useIsNightOwlHours()
  const { locale } = useLanguage()
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isNightOwlHours) return
    const today = new Date().toDateString()
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(SEEN_KEY) === today) return

    window.localStorage.setItem(SEEN_KEY, today)
    setVisible(true)
    const hideTimer = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(hideTimer)
    // Only ever needs to run once when the window first becomes true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNightOwlHours])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -16 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-x-0 top-6 z-[10000] flex justify-center px-4"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-full border border-indigo-400/30 bg-[#0a0f24]/90 px-4 py-2 text-sm text-indigo-200 shadow-[0_0_24px_rgba(99,102,241,0.25)] backdrop-blur-sm">
            <span aria-hidden>🌙</span>
            <span>
              {locale === 'en'
                ? 'Welcome to the 3am club — good to see you out here.'
                : '새벽 3시 클럽에 가입하셨습니다 — 이 시간에 여기까지 오셨네요.'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
