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
          className="pointer-events-none fixed inset-x-0 top-20 z-[10000] flex justify-center px-4"
          aria-live="polite"
        >
          <p className="rounded-md border border-line-strong bg-panel px-4 py-2 text-sm text-fg">
            {locale === 'en' ? 'Welcome to the 3am club. Good to see you up.' : '새벽 3시 클럽입니다. 이 시간까지 깨어 계셨네요.'}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
