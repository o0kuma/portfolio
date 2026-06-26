'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiDownload, FiGithub, FiMail } from 'react-icons/fi'

type TimelineEntry = {
  dateRange: string
  title: string
  organization: string
  description: string
}

type Section = {
  id: string
  label: string
  color: string
  dotColor: string
  entries: TimelineEntry[]
}

const SECTIONS: Section[] = [
  {
    id: 'work',
    label: '경력',
    color: 'text-cyan-400',
    dotColor: 'bg-cyan-400',
    entries: [
      {
        dateRange: '2023.03 ~ 현재',
        title: '프리랜서 프론트엔드 개발자',
        organization: '자기 주도',
        description: '프리랜서로 다양한 웹 프로젝트를 진행하며 자기 주도적으로 개발 및 외주 작업을 수행하고 있습니다.',
      },
      {
        dateRange: '2022.01 ~ 2023.02',
        title: '프론트엔드 개발자',
        organization: '스타트업',
        description: '스타트업에서 웹/앱 서비스 개발을 담당하였으며, React 및 Next.js 기반 프로젝트를 주도적으로 개발했습니다.',
      },
    ],
  },
  {
    id: 'education',
    label: '학력',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    entries: [
      {
        dateRange: '2018.03 ~ 2022.02',
        title: '컴퓨터공학과 졸업',
        organization: 'OO대학교',
        description: '컴퓨터공학을 전공하며 알고리즘, 자료구조, 운영체제, 네트워크 등 기초 CS 지식을 습득했습니다.',
      },
    ],
  },
  {
    id: 'certifications',
    label: '자격증',
    color: 'text-violet-400',
    dotColor: 'bg-violet-400',
    entries: [
      {
        dateRange: '2021.11',
        title: '정보처리기사',
        organization: '한국산업인력공단',
        description: '국가기술자격증 정보처리기사를 취득하였습니다.',
      },
    ],
  },
]

function TimelineCard({ entry, dotColor, index }: { entry: TimelineEntry; dotColor: string; index: number }) {
  return (
    <div className="relative pl-8 mb-8">
      <div
        className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${dotColor} ring-4 ring-neutral-950 z-10`}
        style={{ transform: 'translateX(-50%)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
        className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors"
      >
        <span className="text-xs font-mono text-neutral-500 mb-1 block">{entry.dateRange}</span>
        <h3 className="text-neutral-100 font-semibold text-base mb-0.5">{entry.title}</h3>
        <p className="text-neutral-400 text-sm font-medium mb-2">{entry.organization}</p>
        <p className="text-neutral-500 text-sm leading-relaxed">{entry.description}</p>
      </motion.div>
    </div>
  )
}

export default function ResumePage() {
  return (
    <>
      <style>{`
        @media print {
          header, footer, nav, .print-hide { display: none !important; }
          body { background: #ffffff !important; color: #000000 !important; }
          * { background: transparent !important; color: #000000 !important; border-color: #cccccc !important; }
          a[href]::after { content: " (" attr(href) ")"; font-size: 0.75em; color: #555555; }
          .bg-neutral-900, .bg-neutral-950 { background: #ffffff !important; }
        }
      `}</style>

      {/* Fixed PDF download button */}
      <button
        onClick={() => window.print()}
        className="print-hide fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg transition-colors"
        aria-label="PDF 다운로드"
      >
        <FiDownload className="w-4 h-4" />
        PDF 다운로드
      </button>

      <main className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-2xl mx-auto px-6 py-24">
          {/* Header */}
          <div className="mb-14">
            <Link
              href="/"
              className="print-hide inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 text-sm font-mono mb-8 transition-colors"
            >
              ← 홈으로
            </Link>

            {/* Profile header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-10 pb-8 border-b border-neutral-800"
            >
              <p className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase mb-3">Resume</p>
              <h1 className="text-4xl font-black text-neutral-50 mb-1">오승일</h1>
              <p className="text-indigo-400 font-mono text-sm mb-4">Full-Stack Developer</p>
              <div className="flex items-center gap-4 flex-wrap">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-100 text-sm transition-colors"
                >
                  <FiGithub className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="mailto:c8c8c81828@gmail.com"
                  className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-100 text-sm transition-colors"
                >
                  <FiMail className="w-4 h-4" />
                  c8c8c81828@gmail.com
                </a>
              </div>
            </motion.div>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-black text-neutral-50 mb-1">이력서</h2>
                <p className="text-neutral-500 text-sm font-mono">경력 · 학력 · 자격증</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-14">
            {SECTIONS.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-px bg-neutral-800" />
                  <h2 className={`text-sm font-bold font-mono ${section.color} tracking-[0.15em]`}>
                    {section.label}
                  </h2>
                  <div className="flex-1 h-px bg-neutral-800" />
                </div>

                <div className="relative border-l border-neutral-800 ml-1.5">
                  {section.entries.map((entry, i) => (
                    <TimelineCard key={i} entry={entry} dotColor={section.dotColor} index={i} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
