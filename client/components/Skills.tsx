'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, maskReveal, lineReveal, staggerContainer, staggerItem } from '@/lib/portfolioMotion'

const DEPTH_ZONES = [
  {
    id: 'surface' as const,
    skills: [
      'HTML5', 'CSS3', 'JavaScript', 'SCSS', 'Web Components',
      'jQuery', 'Bootstrap', 'Tailwind CSS', 'Semantic UI',
    ],
  },
  {
    id: 'mid' as const,
    skills: [
      'React', 'Svelte', 'Next.js', 'TypeScript',
      'EJS', 'PixiJS',
      'Git', 'GitHub', 'GitLab', 'Figma', 'Zeplin',
    ],
  },
  {
    id: 'backend' as const,
    skills: [
      'Node.js', 'Express', 'Java', 'Spring Boot',
      'PostgreSQL', 'MySQL', 'MongoDB',
      'Python', 'REST API',
    ],
  },
  {
    id: 'deep' as const,
    skills: [
      'Go', 'PHP',
      'Webpack', 'Vite',
      'Adobe Photoshop', 'Confluence', 'Jira', 'Redmine',
    ],
  },
]

export default function Skills() {
  const { t } = useLanguage()

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

        {/* Skill zones */}
        <div className="space-y-14">
          {DEPTH_ZONES.map((zone, zoneIndex) => {
            const zoneLabel = t.skills.zones[zone.id]
            return (
              <motion.div
                key={zone.id}
                initial="hidden"
                whileInView="visible"
                viewport={portfolioViewport}
                variants={staggerContainer}
                custom={zoneIndex}
              >
                <motion.div variants={staggerItem} className="flex items-center gap-4 mb-5">
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-base font-bold font-mono text-neutral-300">
                      {zoneLabel.depth}
                    </span>
                    <span className="text-neutral-600 text-xs font-mono hidden sm:inline">
                      {zoneLabel.subtitle}
                    </span>
                  </div>
                  <div className="overflow-hidden flex-1 h-px">
                    <motion.div
                      variants={lineReveal}
                      className="w-full h-full bg-neutral-800"
                      style={{ originX: 0 }}
                    />
                  </div>
                  <span className="text-neutral-600 text-xs shrink-0 hidden md:inline">
                    {zoneLabel.description}
                  </span>
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  className="flex flex-wrap gap-2"
                >
                  {zone.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      variants={staggerItem}
                      className="px-3.5 py-1.5 rounded-md text-sm font-medium border border-neutral-700 bg-neutral-950/60 text-neutral-300"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            )
          })}
        </div>

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
