'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiGithub, FiMail, FiArrowDown } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import { portfolioViewport, sectionReveal } from '@/lib/portfolioMotion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

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
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduced ? 1 : 0.35])

  return (
    <motion.section
      ref={sectionRef}
      id="hero"
      style={{ opacity: heroOpacity }}
      className="relative min-h-screen flex items-center border-b border-neutral-800 bg-neutral-950"
    >
      <div className="container-custom relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-28">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={portfolioViewport}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-700 text-neutral-400 text-xs font-mono tracking-widest uppercase mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              {t.hero.badge}
            </div>

            <h1 className="font-black leading-[1.05] mb-6">
              <span className="block text-neutral-50 text-5xl md:text-6xl lg:text-7xl tracking-tight">
                {t.hero.nameMain}
              </span>
              <span className="block text-neutral-400 text-3xl md:text-4xl lg:text-5xl font-semibold mt-3 tracking-tight">
                {t.hero.nameSub}
              </span>
            </h1>

            <p className="text-neutral-500 text-lg leading-relaxed mb-10 max-w-md">
              {interpolate(t.hero.description, { years }).split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
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
            </div>

            <div className="flex items-center gap-6">
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
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroParallaxY }}
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={portfolioViewport}
            transition={{ delay: 0.15 }}
            className="hidden lg:flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="relative w-full max-w-md aspect-square border border-neutral-800 rounded-2xl flex items-center justify-center bg-neutral-900/50">
              <div className="absolute inset-8 border border-neutral-700/60 rounded-xl" />
              <p className="text-[10rem] font-black text-neutral-800/80 leading-none select-none">P</p>
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
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
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
