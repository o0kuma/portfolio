'use client'

import { motion } from 'framer-motion'
import { portfolioViewport } from '@/lib/portfolioMotion'

interface Props {
  children: React.ReactNode
  className?: string
  id?: string
}

/**
 * Wraps each portfolio section with an eilab-style entrance:
 * the whole block slides up and fades in as it enters the viewport.
 * A full-width divider line draws across at the top of each section.
 */
export default function SectionWrapper({ children, className = '', id }: Props) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={portfolioViewport}
      className={className}
    >
      {/* Full-width line that draws L→R on enter */}
      <motion.div
        variants={{
          hidden: { scaleX: 0 },
          visible: {
            scaleX: 1,
            transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        className="w-full h-px bg-neutral-800 origin-left"
      />

      {/* Section content: slides up */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 60 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </motion.section>
  )
}
