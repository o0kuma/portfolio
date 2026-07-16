'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import { portfolioViewport, maskReveal, lineReveal, staggerContainer, staggerItem } from '@/lib/portfolioMotion'
import { SITE_EMAIL } from '@/lib/site'

export default function About() {
  const { t, locale } = useLanguage()
  const years = new Date().getFullYear() - 2019

  const stats = [
    { value: `${years}+`, label: t.about.statYearsSuffix },
    { value: '15+', label: t.about.statProjectsSuffix },
    { value: '1990', label: t.about.statBirthSuffix },
  ]

  return (
    <div className="relative py-32">
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-[1fr_120px] gap-12 lg:gap-20 items-start max-w-5xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={portfolioViewport}
          >
            {/* Section label with line draw */}
            <motion.div variants={staggerItem} className="flex items-center gap-3 mb-12">
              <div className="overflow-hidden w-8 h-px">
                <motion.span
                  variants={lineReveal}
                  className="block w-full h-full bg-neutral-600"
                  style={{ originX: 0 }}
                />
              </div>
              <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase">
                {t.about.label}
              </span>
            </motion.div>

            {/* Heading: masked reveal */}
            <div className="overflow-hidden mb-10">
              <motion.h2
                variants={maskReveal}
                className="text-4xl md:text-5xl font-black text-neutral-50 leading-tight"
              >
                {t.about.heading1}
                <br />
                <span className="text-neutral-400">{t.about.heading2}</span>
              </motion.h2>
            </div>

            <motion.div variants={staggerItem} className="space-y-5 text-neutral-500 text-[1.05rem] leading-[1.85] max-w-2xl">
              <p>{t.about.p1}</p>
              <p>{interpolate(t.about.p2, { years })}</p>
              <p>{t.about.p3}</p>
            </motion.div>

            <motion.div variants={staggerItem} className="mt-12 flex flex-wrap gap-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="overflow-hidden">
                    <motion.div variants={maskReveal} className="text-3xl font-black text-neutral-100">
                      {stat.value}
                    </motion.div>
                  </div>
                  <div className="text-neutral-600 text-sm mt-1 font-mono">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={staggerItem} className="mt-10 flex flex-wrap gap-2.5">
              {[t.about.role, SITE_EMAIL].map((chip) => (
                <span
                  key={chip}
                  className="px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-500 text-sm"
                >
                  {chip}
                </span>
              ))}
            </motion.div>

            {/* 현재 관심사 */}
            <motion.div variants={staggerItem} className="mt-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="overflow-hidden w-5 h-px">
                  <motion.span
                    variants={lineReveal}
                    className="block w-full h-full bg-neutral-700"
                    style={{ originX: 0 }}
                  />
                </div>
                <span className="text-neutral-500 text-xs font-mono tracking-[0.18em] uppercase">
                  {locale === 'en' ? 'Current interests' : '현재 관심사'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(locale === 'en'
                  ? ['Three.js WebGL', 'AI integration', 'Game development', 'Performance optimization', 'Full-stack']
                  : ['Three.js WebGL', 'AI 통합', '게임 개발', '성능 최적화', '풀스택']
                ).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-indigo-900/40 hover:border-indigo-600 hover:text-indigo-300 transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 사용 중인 도구 */}
            <motion.div variants={staggerItem} className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="overflow-hidden w-5 h-px">
                  <motion.span
                    variants={lineReveal}
                    className="block w-full h-full bg-neutral-700"
                    style={{ originX: 0 }}
                  />
                </div>
                <span className="text-neutral-500 text-xs font-mono tracking-[0.18em] uppercase">
                  {locale === 'en' ? 'Tools I use' : '사용 중인 도구'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'VS Code', icon: '⌨️' },
                  { name: 'Cursor', icon: '✦' },
                  { name: 'Figma', icon: '◈' },
                  { name: 'Vercel', icon: '▲' },
                  { name: 'Neon DB', icon: '⬡' },
                  { name: 'GitHub', icon: '◯' },
                ].map((tool) => (
                  <span
                    key={tool.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-neutral-200 transition-colors cursor-default"
                  >
                    <span aria-hidden="true" className="text-neutral-500">{tool.icon}</span>
                    {tool.name}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={portfolioViewport}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hidden lg:flex items-center justify-center pt-4"
            aria-hidden="true"
          >
            <div
              className="text-[7rem] font-black leading-none tracking-tighter select-none text-neutral-800"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              OSI
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
