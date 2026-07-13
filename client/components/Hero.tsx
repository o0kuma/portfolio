'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
import { FiGithub, FiMail, FiArrowDown } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import { portfolioViewport, maskReveal, staggerContainer, staggerItem, EASE_OUT } from '@/lib/portfolioMotion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import TypingText from '@/components/portfolio/TypingText'

export default function Hero() {
  const { t } = useLanguage()
  const years = new Date().getFullYear() - 2019
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const heroParallaxY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 72])
  const heroParallaxTransform = useMotionTemplate`translateY(${heroParallaxY}px)`
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduced ? 1 : 0.35])

  return (
    <motion.section
      ref={sectionRef}
      id="hero"
      style={{ opacity: heroOpacity }}
      className="relative min-h-screen flex items-center border-b border-neutral-800 dark:border-white/[0.08] bg-neutral-950 dark:bg-transparent"
    >
      <div className="container-custom relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-28">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-700 text-neutral-400 text-xs font-mono tracking-widest uppercase mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              {t.hero.badge}
            </motion.div>

            {/* Name: masked reveal */}
            <h1 className="font-black leading-[1.05] mb-6">
              <div className="overflow-hidden">
                <motion.span
                  variants={maskReveal}
                  className="block text-neutral-50 text-5xl md:text-6xl lg:text-7xl tracking-tight"
                >
                  {t.hero.nameMain}
                </motion.span>
              </div>
              <div className="overflow-hidden mt-3">
                <motion.span
                  variants={maskReveal}
                  transition={{ delay: 0.1 }}
                  className="block text-neutral-400 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight"
                >
                  {t.hero.nameSub}
                </motion.span>
              </div>
            </h1>

            <motion.p
              variants={staggerItem}
              className="text-neutral-500 text-lg leading-relaxed mb-10 max-w-md"
            >
              {interpolate(t.hero.description, { years }).split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </motion.p>

            <motion.div variants={staggerItem} className="flex flex-wrap gap-3 mb-12">
              <motion.a
                href="#projects"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-neutral-100 text-neutral-950 font-semibold text-sm"
              >
                {t.hero.viewProjects}
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-neutral-600 text-neutral-300 font-semibold text-sm hover:border-neutral-400 hover:text-neutral-100 transition-colors"
              >
                {t.hero.contactMe}
              </motion.a>
              <motion.a
                href="/cv.pdf"
                download
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-neutral-700 text-neutral-500 font-semibold text-sm hover:border-neutral-500 hover:text-neutral-300 transition-colors"
              >
                ↓ CV
              </motion.a>
            </motion.div>

            <motion.div variants={staggerItem} className="flex items-center gap-6">
              <a
                href="https://github.com/oikikomori/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-200 transition-colors text-sm"
              >
                <FiGithub size={17} />
                <span>GitHub</span>
              </a>
              <a
                href="mailto:c8c8c81828@gmail.com"
                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-200 transition-colors text-sm"
              >
                <FiMail size={17} />
                <span>Email</span>
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ transform: heroParallaxTransform }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: EASE_OUT }}
            className="hidden lg:flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-neutral-800 animate-[spin_20s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-600" />
              </div>
              {/* Inner ring */}
              <div className="absolute inset-8 rounded-full border border-neutral-700/50 animate-[spin_12s_linear_infinite_reverse]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-neutral-500" />
              </div>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="text-6xl font-black text-neutral-800 select-none">⟨/⟩</div>
                <div className="text-center space-y-1">
                  <p className="text-neutral-300 font-mono text-sm font-semibold">
                    <TypingText phrases={['Frontend Dev', 'Full-Stack Dev', 'Game Dev', 'UI Craftsman']} />
                  </p>
                  <p className="text-neutral-600 text-xs font-mono">since 2019</p>
                </div>
                {/* Skill dots */}
                <div className="flex flex-wrap justify-center gap-1.5 max-w-[180px] mt-2">
                  {['React', 'Next.js', 'TypeScript', 'Node.js', 'Go'].map(s => (
                    <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-700 text-neutral-500 bg-neutral-900/60">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.button
          animate={{ transform: ['translateY(0px)', 'translateY(6px)', 'translateY(0px)'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }}
          className="text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label={t.hero.scrollDown}
        >
          <FiArrowDown size={20} />
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
