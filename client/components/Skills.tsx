'use client'

import { motion } from 'framer-motion'

const DEPTH_ZONES = [
  {
    id: 'surface',
    depth: '수면',
    subtitle: 'Surface — 전문 영역',
    description: '매일 쓰고 누구보다 자신 있는 기술',
    color: '#22d3ee',
    bgOpacity: '0.08',
    borderOpacity: '0.3',
    skills: [
      'HTML5', 'CSS3', 'JavaScript', 'SCSS', 'Web Components',
      'jQuery', 'Bootstrap', 'Tailwind CSS', 'Semantic UI',
    ],
  },
  {
    id: 'mid',
    depth: '중층',
    subtitle: 'Mid Water — 활용 영역',
    description: '프로젝트에 적극적으로 활용하는 기술',
    color: '#38bdf8',
    bgOpacity: '0.06',
    borderOpacity: '0.22',
    skills: [
      'React', 'Svelte', 'Next.js', 'TypeScript',
      'Node.js', 'EJS', 'PixiJS',
      'Git', 'GitHub', 'GitLab', 'Figma', 'Zeplin',
    ],
  },
  {
    id: 'deep',
    depth: '심해',
    subtitle: 'Deep — 탐험 영역',
    description: '경험은 있지만 계속 탐구 중인 기술',
    color: '#34d399',
    bgOpacity: '0.04',
    borderOpacity: '0.16',
    skills: [
      'Go', 'PHP', 'MySQL', 'MongoDB',
      'Webpack', 'Vite',
      'Adobe Photoshop', 'Confluence', 'Jira', 'Redmine',
    ],
  },
]

export default function Skills() {
  return (
    <section
      id="skills"
      className="relative overflow-hidden py-32"
      style={{ background: 'linear-gradient(180deg, #0a1e38 0%, #0c2a4a 60%, #0a1e38 100%)' }}
    >
      {/* Top hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

      {/* Depth guide lines in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-x-0 top-[28%] h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.06), transparent)' }}
        />
        <div
          className="absolute inset-x-0 top-[58%] h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.05), transparent)' }}
        />
      </div>

      <div className="container-custom relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-cyan-400/80" />
            <span className="text-cyan-400 text-xs font-mono tracking-[0.2em] uppercase">Skills</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            바다의 깊이처럼<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #22d3ee, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              쌓아온 기술들
            </span>
          </h2>
          <p className="text-white/35 text-base max-w-md font-mono">
            수면에서 심해까지 — 다양한 깊이로 다양한 기술을 다룹니다.
          </p>
        </motion.div>

        {/* Depth zones */}
        <div className="space-y-14">
          {DEPTH_ZONES.map((zone, zoneIndex) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: zoneIndex * 0.1 }}
            >
              {/* Zone header row */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-baseline gap-2 shrink-0">
                  <span
                    className="text-base font-bold font-mono"
                    style={{ color: zone.color }}
                  >
                    {zone.depth}
                  </span>
                  <span className="text-white/25 text-xs font-mono hidden sm:inline">
                    {zone.subtitle}
                  </span>
                </div>
                {/* Separator line */}
                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(90deg, ${zone.color}35, transparent)`,
                  }}
                />
                <span className="text-white/20 text-xs shrink-0 hidden md:inline">
                  {zone.description}
                </span>
              </div>

              {/* Skill tags — water flow layout */}
              <div className="flex flex-wrap gap-2.5">
                {zone.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: zoneIndex * 0.08 + skillIndex * 0.03,
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.18 } }}
                    className="px-4 py-2 rounded-full text-sm font-medium cursor-default select-none"
                    style={{
                      border: `1px solid ${zone.color}${Math.round(parseFloat(zone.borderOpacity) * 255).toString(16).padStart(2, '0')}`,
                      background: `${zone.color}${Math.round(parseFloat(zone.bgOpacity) * 255).toString(16).padStart(2, '0')}`,
                      color: zone.color,
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 text-white/20 text-xs font-mono text-center tracking-widest"
        >
          — 항상 새로운 기술을 배우는 중입니다 —
        </motion.p>
      </div>
    </section>
  )
}
