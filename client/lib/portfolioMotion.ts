/** Shared Framer Motion presets for /portfolio scroll reveals. */

export const portfolioViewport = {
  once: true,
  amount: 0.15,
  margin: '-40px 0px -60px 0px',
} as const

/** Section container: strong upward reveal */
export const sectionReveal = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
} as const

/**
 * Masked text reveal — parent must have overflow:hidden.
 * Text slides up from below the clip boundary.
 */
export const maskReveal = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
} as const

/** Horizontal line: draws left → right */
export const lineReveal = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
} as const

/** Fade + slide up for body text / cards */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
} as const

export const staggerItem = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
} as const
