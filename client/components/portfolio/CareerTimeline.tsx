'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, staggerContainer, staggerItem, maskReveal, lineReveal } from '@/lib/portfolioMotion'

type TimelineItem = {
  year: string
  period: string
  company: string
  role: string
  type: 'work' | 'education'
  highlights: string[]
  tech?: string[]
}

const TIMELINE: TimelineItem[] = [
  {
    year: '2025',
    period: '2025 — 현재',
    company: 'Quantum-AI',
    role: 'Frontend Developer',
    type: 'work',
    highlights: [
      'B2B 오픈마켓 플랫폼 개발 (진행 중)',
      '프론트엔드 아키텍처 설계 및 구현',
      'UI/UX 기획 및 퍼블리싱',
    ],
    tech: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS'],
  },
  {
    year: '2020',
    period: '2020 — 2025',
    company: '소프트위즈',
    role: 'Frontend Developer / Publisher',
    type: 'work',
    highlights: [
      '기업 웹사이트 및 서비스 프론트엔드 개발',
      'UI 컴포넌트 설계 및 퍼블리싱',
      '다수 프로젝트 유지보수 및 기능 고도화',
    ],
    tech: ['JavaScript', 'jQuery', 'HTML5', 'CSS3', 'SCSS'],
  },
  {
    year: '2019',
    period: '2019 — 2020',
    company: '스마일데이',
    role: 'Frontend Developer / Publisher (프리랜서)',
    type: 'work',
    highlights: [
      '프리랜서 형식의 프론트엔드 및 퍼블리싱 작업',
      '반응형 웹 UI 제작',
      '다양한 클라이언트 웹 프로젝트 참여',
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript', 'jQuery'],
  },
  {
    year: '2018',
    period: '2018 — 2019',
    company: '크로스쇼크',
    role: 'Frontend Developer / Publisher',
    type: 'work',
    highlights: [
      '스타트업 초기 멤버로 합류',
      '서비스 프론트엔드 개발 및 퍼블리싱',
      '개발자 커리어 시작',
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'Bootstrap'],
  },
]

export default function CareerTimeline() {
  const { t: _t } = useLanguage()

  return (
    <div className="py-32 border-b border-neutral-800 bg-neutral-900">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
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
              경력 타임라인
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={portfolioViewport}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`pl-12 md:pl-0 w-full md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="group rounded-xl border border-neutral-800 bg-neutral-950 p-6 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-neutral-600">{item.period}</span>
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                        item.type === 'work' ? 'text-cyan-400 border-cyan-400/30' : 'text-amber-400 border-amber-400/30'
                      }`}>
                        {item.type === 'work' ? 'Work' : 'Education'}
                      </span>
                    </div>
                    <h3 className="font-bold text-neutral-100 text-lg mb-0.5">{item.company}</h3>
                    <p className="text-neutral-500 text-sm font-mono mb-4">{item.role}</p>
                    <ul className="space-y-1.5 mb-4">
                      {item.highlights.map((h, j) => (
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
