/** Shared Framer Motion presets for /portfolio scroll reveals. */

export const portfolioViewport = {
  once: true,
  amount: 0.15,
  margin: '-40px 0px -60px 0px',
} as const

/** Section container: stronger upward reveal */
export const sectionReveal = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
} as const

/** Horizontal line: draws left → right */
export const lineReveal = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
} as const

/** Section label text: slides up from slight offset */
export const labelReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
} as const

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

/** Section header row: stagger the line + label together */
export const sectionHeaderContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
} as const
