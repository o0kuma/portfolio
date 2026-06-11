'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export default function PortfolioScrollProgress() {
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })
  const scaleX = useTransform(reduced ? scrollYProgress : smooth, [0, 1], [0, 1])

  if (reduced) return null

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-neutral-100/90"
      style={{ scaleX }}
    />
  )
}
