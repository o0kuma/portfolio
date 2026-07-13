/** Shared Framer Motion presets for /portfolio scroll reveals. */

/** The repo's shared ease-out curve — cite this, never retype the four numbers. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const
export const EASE_OUT_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)'

export const portfolioViewport = {
  once: true,
  amount: 0.12,
  margin: '-30px 0px -50px 0px',
} as const

/** Section container: slides up as a block */
export const sectionReveal = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT },
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
    transition: { duration: 0.9, ease: EASE_OUT },
  },
} as const

/** Full-width horizontal rule: draws left → right */
export const lineReveal = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: EASE_OUT },
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
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
} as const
