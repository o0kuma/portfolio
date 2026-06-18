'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, maskReveal, lineReveal, staggerContainer, staggerItem } from '@/lib/portfolioMotion'
import SkillRadar from '@/components/portfolio/SkillRadar'

type SkillCategory = {
  id: string
  label: string
  labelKo: string
  desc: string
  descKo: string
  color: string       // tailwind text color for the label
  accent: string      // tailwind border/bg accent for chips
  skills: string[]
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'publishing',
    label: 'Publishing',
    labelKo: '퍼블리싱',
    desc: 'HTML · CSS · Markup',
    descKo: '마크업 · 스타일링',
    color: 'text-orange-400',
    accent: 'border-orange-400/20 bg-orange-400/5 text-orange-200/80',
    skills: ['HTML5', 'CSS3', 'SCSS', 'Tailwind CSS', 'Bootstrap', 'Semantic UI', 'Web Components'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    labelKo: '프론트엔드',
    desc: 'UI Frameworks · SPA · SSR',
    descKo: 'UI 프레임워크 · SPA · SSR',
    color: 'text-cyan-400',
    accent: 'border-cyan-400/20 bg-cyan-400/5 text-cyan-200/80',
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Svelte', 'EJS', 'jQuery', 'PixiJS'],
  },
  {
    id: 'backend',
    label: 'Backend',
    labelKo: '백엔드',
    desc: 'Server · API · Runtime',
    descKo: '서버 · API · 런타임',
    color: 'text-emerald-400',
    accent: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-200/80',
    skills: ['Node.js', 'Express', 'Java', 'Spring Boot', 'Go', 'PHP', 'Python', 'REST API'],
  },
  {
    id: 'database',
    label: 'Database',
    labelKo: '데이터베이스',
    desc: 'RDBMS · NoSQL',
    descKo: '관계형 · 비관계형 DB',
    color: 'text-violet-400',
    accent: 'border-violet-400/20 bg-violet-400/5 text-violet-200/80',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB'],
  },
  {
    id: 'devtools',
    label: 'Dev Tools',
    labelKo: '개발 도구',
    desc: 'Version Control · Build · CI',
    descKo: '버전 관리 · 빌드 · CI',
    color: 'text-amber-400',
    accent: 'border-amber-400/20 bg-amber-400/5 text-amber-200/80',
    skills: ['Git', 'GitHub', 'GitLab', 'Webpack', 'Vite'],
  },
  {
    id: 'design',
    label: 'Design & PM',
    labelKo: '디자인 · 협업',
    desc: 'UI Design · Project Mgmt',
    descKo: 'UI 디자인 · 프로젝트 관리',
    color: 'text-pink-400',
    accent: 'border-pink-400/20 bg-pink-400/5 text-pink-200/80',
    skills: ['Figma', 'Zeplin', 'Adobe Photoshop', 'Confluence', 'Jira', 'Redmine'],
  },
]

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

        {/* Skill categories */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {SKILL_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={portfolioViewport}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-5 hover:border-neutral-700 transition-colors"
            >
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
              {/* Chips */}
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border ${cat.accent}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
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
