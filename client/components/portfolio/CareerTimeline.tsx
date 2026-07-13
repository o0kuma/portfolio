'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, staggerContainer, staggerItem, maskReveal, lineReveal, EASE_OUT } from '@/lib/portfolioMotion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

type TimelineItem = {
  year: string
  period: string
  periodEn: string
  company: string
  companyEn: string
  role: string
  roleEn: string
  type: 'work' | 'education'
  highlights: string[]
  highlightsEn: string[]
  tech?: string[]
}

const TIMELINE: TimelineItem[] = [
  {
    year: '2025',
    period: '2025.12 — 현재',
    periodEn: '2025.12 — Present',
    company: 'Quantum-AI',
    companyEn: 'Quantum-AI',
    role: 'Frontend Developer',
    roleEn: 'Frontend Developer',
    type: 'work',
    highlights: [
      '프론트엔드 개발',
      '프론트엔드 아키텍처 설계 및 구현',
      'UI/UX 기획 및 퍼블리싱',
    ],
    highlightsEn: [
      'Frontend development',
      'Frontend architecture design and implementation',
      'UI/UX planning and markup',
    ],
    tech: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS'],
  },
  {
    year: '2020',
    period: '2020.05 — 2025.12',
    periodEn: '2020.05 — 2025.12',
    company: '(주)소프트위즈',
    companyEn: 'Softwiz Inc.',
    role: '웹팀 / 대리',
    roleEn: 'Web team / Assistant Manager',
    type: 'work',
    highlights: [
      'Next.js 기반 브랜드 사이트 구축 (BABA OPTION)',
      'Svelte + Web Components CRM 개발',
      'PixiJS 기반 트레이딩 UI 개발',
      'MySQL 연동 사내 관리 시스템 개발',
    ],
    highlightsEn: [
      'Built a Next.js-based brand site (BABA OPTION)',
      'Developed a Svelte + Web Components CRM',
      'Built a PixiJS-based trading UI',
      'Developed an internal management system with MySQL',
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Svelte', 'PixiJS', 'MySQL'],
  },
  {
    year: '2018',
    period: '2018.12 — 2020.02',
    periodEn: '2018.12 — 2020.02',
    company: '스마일데이',
    companyEn: 'SmileDay',
    role: '웹개발팀 / 사원',
    roleEn: 'Web dev team / Staff',
    type: 'work',
    highlights: [
      '에이전시 외주 퍼블리싱 작업',
      '반응형 웹 UI 제작',
      'jQuery 기반 인터랙션 및 그누보드 튜닝',
    ],
    highlightsEn: [
      'Agency outsourced markup work',
      'Built responsive web UIs',
      'jQuery-based interactions and Gnuboard tuning',
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'PHP'],
  },
]

export default function CareerTimeline() {
  const { locale } = useLanguage()
  const reduced = usePrefersReducedMotion()

  return (
    <div className="py-32 border-b border-neutral-800 dark:border-white/[0.08] bg-neutral-900 dark:bg-transparent">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={portfolioViewport}
          className="mb-20"
        >
          <motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
            <div className="overflow-hidden w-8 h-px">
              <motion.span variants={lineReveal} className="block w-full h-full bg-neutral-600" style={{ originX: 0 }} />
            </div>
            <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase">Career</span>
          </motion.div>
          <div className="overflow-hidden mb-4">
            <motion.h2 variants={maskReveal} className="text-4xl md:text-5xl font-black text-neutral-50 leading-tight">
              {locale === 'en' ? 'Career timeline' : '경력 타임라인'}
              <br />
              <span className="text-neutral-400">Career History</span>
            </motion.h2>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-neutral-800 md:-translate-x-1/2" />

          <div className="space-y-12">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: reduced ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={portfolioViewport}
                transition={{ duration: 0.6, delay: reduced ? 0 : i * 0.1, ease: EASE_OUT }}
                className={`relative flex gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`pl-12 md:pl-0 w-full md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="group rounded-xl border border-neutral-800 bg-neutral-950 p-6 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-neutral-600">{locale === 'en' ? item.periodEn : item.period}</span>
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                        item.type === 'work' ? 'text-cyan-400 border-cyan-400/30' : 'text-amber-400 border-amber-400/30'
                      }`}>
                        {item.type === 'work' ? 'Work' : 'Education'}
                      </span>
                    </div>
                    <h3 className="font-bold text-neutral-100 text-lg mb-0.5">{locale === 'en' ? item.companyEn : item.company}</h3>
                    <p className="text-neutral-500 text-sm font-mono mb-4">{locale === 'en' ? item.roleEn : item.role}</p>
                    <ul className="space-y-1.5 mb-4">
                      {(locale === 'en' ? item.highlightsEn : item.highlights).map((h, j) => (
                        <li key={j} className="text-sm text-neutral-400 flex items-start gap-2">
                          <span className="text-neutral-700 mt-1 shrink-0">▸</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                    {item.tech && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tech.map(tech => (
                          <span key={tech} className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-800 text-neutral-600 bg-neutral-900">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Center dot */}
                <div className="absolute left-4 md:left-1/2 top-6 w-3 h-3 rounded-full border-2 border-neutral-600 bg-neutral-900 md:-translate-x-1/2 translate-x-[-6px] group-hover:border-neutral-400 transition-colors" />

                {/* Year label (desktop only) */}
                <div className={`hidden md:flex absolute top-5 ${i % 2 === 0 ? 'left-[calc(50%+1.5rem)]' : 'right-[calc(50%+1.5rem)]'} items-center`}>
                  <span className="text-2xl font-black text-neutral-800 font-mono">{item.year}</span>
                </div>

                {/* Empty spacer for the other side */}
                <div className="hidden md:block w-[calc(50%-2rem)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
