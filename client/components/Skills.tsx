'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, maskReveal, lineReveal, staggerContainer, staggerItem } from '@/lib/portfolioMotion'
import SkillRadar from '@/components/portfolio/SkillRadar'

const SkillSphere = dynamic(() => import('./SkillSphere'), { ssr: false })

type Skill = { name: string; level: number }  // level 0-100

type SkillCategory = {
  id: string
  label: string
  labelKo: string
  desc: string
  descKo: string
  color: string
  barColor: string    // tailwind bg color for the progress bar
  accent: string
  skills: Skill[]
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'publishing',
    label: 'Publishing',
    labelKo: '퍼블리싱',
    desc: 'HTML · CSS · Markup',
    descKo: '마크업 · 스타일링',
    color: 'text-orange-400',
    barColor: 'bg-orange-400',
    accent: 'border-orange-400/20 bg-orange-400/5 text-orange-200/80',
    skills: [
      { name: 'HTML5',        level: 98 },
      { name: 'CSS3',         level: 95 },
      { name: 'SCSS',         level: 90 },
      { name: 'Tailwind CSS', level: 92 },
      { name: 'Bootstrap',    level: 85 },
      { name: 'Semantic UI',  level: 75 },
      { name: 'Web Components', level: 70 },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    labelKo: '프론트엔드',
    desc: 'UI Frameworks · SPA · SSR',
    descKo: 'UI 프레임워크 · SPA · SSR',
    color: 'text-cyan-400',
    barColor: 'bg-cyan-400',
    accent: 'border-cyan-400/20 bg-cyan-400/5 text-cyan-200/80',
    skills: [
      { name: 'JavaScript', level: 95 },
      { name: 'TypeScript', level: 88 },
      { name: 'React',      level: 93 },
      { name: 'Next.js',    level: 90 },
      { name: 'Svelte',     level: 82 },
      { name: 'jQuery',     level: 85 },
      { name: 'EJS',        level: 72 },
      { name: 'PixiJS',     level: 65 },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    labelKo: '백엔드',
    desc: 'Server · API · Runtime',
    descKo: '서버 · API · 런타임',
    color: 'text-emerald-400',
    barColor: 'bg-emerald-400',
    accent: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-200/80',
    skills: [
      { name: 'Node.js',     level: 85 },
      { name: 'Express',     level: 83 },
      { name: 'Java',        level: 72 },
      { name: 'Spring Boot', level: 68 },
      { name: 'Go',          level: 62 },
      { name: 'Python',      level: 60 },
      { name: 'PHP',         level: 65 },
      { name: 'REST API',    level: 90 },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    labelKo: '데이터베이스',
    desc: 'RDBMS · NoSQL',
    descKo: '관계형 · 비관계형 DB',
    color: 'text-violet-400',
    barColor: 'bg-violet-400',
    accent: 'border-violet-400/20 bg-violet-400/5 text-violet-200/80',
    skills: [
      { name: 'PostgreSQL', level: 82 },
      { name: 'MySQL',      level: 80 },
      { name: 'MongoDB',    level: 72 },
    ],
  },
  {
    id: 'devtools',
    label: 'Dev Tools',
    labelKo: '개발 도구',
    desc: 'Version Control · Build · CI',
    descKo: '버전 관리 · 빌드 · CI',
    color: 'text-amber-400',
    barColor: 'bg-amber-400',
    accent: 'border-amber-400/20 bg-amber-400/5 text-amber-200/80',
    skills: [
      { name: 'Git',     level: 90 },
      { name: 'GitHub',  level: 88 },
      { name: 'GitLab',  level: 82 },
      { name: 'Webpack', level: 72 },
      { name: 'Vite',    level: 78 },
    ],
  },
  {
    id: 'design',
    label: 'Design & PM',
    labelKo: '디자인 · 협업',
    desc: 'UI Design · Project Mgmt',
    descKo: 'UI 디자인 · 프로젝트 관리',
    color: 'text-pink-400',
    barColor: 'bg-pink-400',
    accent: 'border-pink-400/20 bg-pink-400/5 text-pink-200/80',
    skills: [
      { name: 'Figma',            level: 85 },
      { name: 'Zeplin',           level: 78 },
      { name: 'Adobe Photoshop',  level: 70 },
      { name: 'Confluence',       level: 80 },
      { name: 'Jira',             level: 82 },
      { name: 'Redmine',          level: 75 },
    ],
  },
]

type CardProps = {
  cat: SkillCategory
  locale: string
  index: number
}

function SkillCard({ cat, locale, index }: CardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={portfolioViewport}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative rounded-xl border border-neutral-800 bg-neutral-950/50 p-5 transition-colors hover:border-neutral-700 overflow-hidden cursor-default"
    >
      {/* Subtle glow on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)' }}
      />

      {/* Category header */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-sm font-bold font-mono ${cat.color}`}>
          {locale === 'ko' ? cat.labelKo : cat.label}
        </span>
        <div className="flex-1 h-px bg-neutral-800" />
        <span className="text-neutral-700 text-[10px] font-mono hidden sm:inline">
          {locale === 'ko' ? cat.descKo : cat.desc}
        </span>
      </div>

      {/* Default: chips */}
      <AnimatePresence initial={false} mode="wait">
        {!hovered ? (
          <motion.div
            key="chips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-wrap gap-1.5"
          >
            {cat.skills.map((skill) => (
              <span
                key={skill.name}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border ${cat.accent}`}
              >
                {skill.name}
              </span>
            ))}
          </motion.div>
        ) : (
          /* Hover: proficiency bars */
          <motion.div
            key="bars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-2.5"
          >
            {cat.skills.map((skill, si) => (
              <div key={skill.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-neutral-400 font-mono truncate">{skill.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${cat.barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.5, delay: si * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="w-8 text-right text-[10px] font-mono text-neutral-600 shrink-0">
                  {skill.level}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover hint — visible only when not hovered */}
      <motion.p
        animate={{ opacity: hovered ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        className="mt-3 text-[10px] font-mono text-neutral-800 pointer-events-none"
      >
        hover to see levels
      </motion.p>
    </motion.div>
  )
}

const skillBars = [
  { name: 'React / Next.js', level: 90, color: 'bg-blue-500' },
  { name: 'TypeScript', level: 85, color: 'bg-blue-400' },
  { name: 'TailwindCSS', level: 88, color: 'bg-cyan-500' },
  { name: 'Node.js', level: 70, color: 'bg-green-500' },
  { name: 'PostgreSQL', level: 65, color: 'bg-green-400' },
  { name: 'Git / GitHub', level: 85, color: 'bg-purple-500' },
]

function SkillBarItem({ skill, index }: { skill: typeof skillBars[number]; index: number }) {
  const barRef = useRef<HTMLDivElement>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimated(true)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={barRef} className="flex items-center gap-4">
      <span className="w-36 shrink-0 text-sm text-neutral-300 font-mono">{skill.name}</span>
      <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${skill.color} transition-all duration-700`}
          style={{
            width: animated ? `${skill.level}%` : '0%',
            transitionDelay: `${index * 80}ms`,
          }}
        />
      </div>
      <span className="w-10 text-right text-xs font-mono text-neutral-500 shrink-0">{skill.level}%</span>
    </div>
  )
}

export default function Skills() {
  const { t, locale } = useLanguage()

  return (
    <div className="relative py-32">
      <div className="container-custom relative z-10">

        {/* Section header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={portfolioViewport}
          className="mb-20"
        >
          <motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
            <div className="overflow-hidden w-8 h-px">
              <motion.span
                variants={lineReveal}
                className="block w-full h-full bg-neutral-600"
                style={{ originX: 0 }}
              />
            </div>
            <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase">
              {t.skills.label}
            </span>
          </motion.div>

          <div className="overflow-hidden mb-4">
            <motion.h2 variants={maskReveal} className="text-4xl md:text-5xl font-black text-neutral-50 leading-tight">
              {t.skills.heading1}
              <br />
              <span className="text-neutral-400">{t.skills.heading2}</span>
            </motion.h2>
          </div>

          <motion.p variants={staggerItem} className="text-neutral-600 text-base max-w-md font-mono">
            {t.skills.subtext}
          </motion.p>
        </motion.div>

        {/* 3D Skill Tag Cloud Sphere */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={portfolioViewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="text-xs font-mono text-neutral-600 tracking-[0.2em] uppercase mb-4 text-center">
            — Skill Cloud
          </p>
          <SkillSphere />
        </motion.div>

        {/* Skill categories */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SKILL_CATEGORIES.map((cat, i) => (
            <SkillCard key={cat.id} cat={cat} locale={locale} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={portfolioViewport}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 pt-16 border-t border-neutral-800"
        >
          <p className="text-xs font-mono text-neutral-600 tracking-[0.2em] uppercase mb-10 text-center">
            — Skill Overview
          </p>
          <div className="flex justify-center">
            <SkillRadar />
          </div>
        </motion.div>

        {/* Skill progress bars */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={portfolioViewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 pt-12 border-t border-neutral-800"
        >
          <p className="text-xs font-mono text-neutral-600 tracking-[0.2em] uppercase mb-8 text-center">
            — Core Proficiency
          </p>
          <div className="max-w-xl mx-auto space-y-5">
            {skillBars.map((skill, i) => (
              <SkillBarItem key={skill.name} skill={skill} index={i} />
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-neutral-700 text-xs font-mono text-center tracking-widest"
        >
          {t.skills.footer}
        </motion.p>
      </div>
    </div>
  )
}
