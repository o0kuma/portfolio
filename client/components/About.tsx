'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function About() {
  const { t } = useLanguage()
  const years = new Date().getFullYear() - 2019

  const stats = [
    { value: `${years}+`, label: t.about.statYearsSuffix },
    { value: '15+', label: t.about.statProjectsSuffix },
    { value: '1990', label: t.about.statBirthSuffix },
  ]

  return (
    <section id="about" className="relative py-32 border-b border-neutral-800 bg-neutral-950">
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-[1fr_120px] gap-12 lg:gap-20 items-start max-w-5xl">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={item} className="flex items-center gap-3 mb-12">
              <span className="w-8 h-px bg-neutral-600" />
              <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase">
                {t.about.label}
              </span>
            </motion.div>

            <motion.h2 variants={item} className="text-4xl md:text-5xl font-black text-neutral-50 leading-tight mb-10">
              {t.about.heading1}
              <br />
              <span className="text-neutral-400">{t.about.heading2}</span>
            </motion.h2>

            <motion.div variants={item} className="space-y-5 text-neutral-500 text-[1.05rem] leading-[1.85] max-w-2xl">
              <p>{t.about.p1}</p>
              <p>{interpolate(t.about.p2, { years })}</p>
              <p>{t.about.p3}</p>
            </motion.div>

            <motion.div variants={item} className="mt-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-5 h-px bg-neutral-700" />
                <span className="text-neutral-500 text-xs font-mono tracking-[0.18em] uppercase">
                  {t.about.recentWork}
                </span>
              </div>
              <ul className="space-y-3">
                {t.about.works.map((work) => (
                  <li key={work.label} className="flex items-start gap-3">
                    <span className="mt-[0.55rem] w-1 h-1 rounded-full bg-neutral-600 shrink-0" />
                    <span className="text-neutral-500 text-sm leading-relaxed">
                      {work.label}
                      {work.status && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[0.65rem] font-mono border border-neutral-700 text-neutral-400 align-middle">
                          {work.status}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={item} className="mt-12 flex flex-wrap gap-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-black text-neutral-100">{stat.value}</div>
                  <div className="text-neutral-600 text-sm mt-1 font-mono">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={item} className="mt-10 flex flex-wrap gap-2.5">
              {[t.about.location, t.about.role, 'c8c8c81828@gmail.com'].map((chip) => (
                <span
                  key={chip}
                  className="px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-500 text-sm"
                >
                  {chip}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
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
    </section>
  )
}
