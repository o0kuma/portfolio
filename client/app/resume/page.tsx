'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

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

function TimelineCard({ entry, dotColor }: { entry: TimelineEntry; dotColor: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([obs]) => {
        if (obs.isIntersecting) {
          el.classList.remove('opacity-0', 'translate-y-4')
          el.classList.add('opacity-100', 'translate-y-0')
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative pl-8 mb-8">
      {/* dot on the line */}
      <div
        className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${dotColor} ring-4 ring-neutral-950 z-10`}
        style={{ transform: 'translateX(-50%)' }}
      />

      <div
        ref={ref}
        className="opacity-0 translate-y-4 transition-all duration-500 ease-out bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700"
      >
        <span className="text-xs font-mono text-neutral-500 mb-1 block">{entry.dateRange}</span>
        <h3 className="text-neutral-100 font-semibold text-base mb-0.5">{entry.title}</h3>
        <p className="text-neutral-400 text-sm font-medium mb-2">{entry.organization}</p>
        <p className="text-neutral-500 text-sm leading-relaxed">{entry.description}</p>
      </div>
    </div>
  )
}

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 text-sm font-mono mb-8 transition-colors"
          >
            ← 홈으로
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase mb-3">Resume</p>
              <h1 className="text-4xl font-black text-neutral-50 mb-2">이력서</h1>
              <p className="text-neutral-500 text-sm font-mono">경력 · 학력 · 자격증</p>
            </div>
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-500 rounded-lg text-sm font-medium text-neutral-200 transition-colors shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 10.5L3.5 6.5M7.5 10.5L11.5 6.5M7.5 10.5V1.5M2 13.5H13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              PDF 다운로드
            </a>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-14">
          {SECTIONS.map((section) => (
            <div key={section.id}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-px bg-neutral-800" />
                <h2 className={`text-sm font-bold font-mono ${section.color} tracking-[0.15em]`}>
                  {section.label}
                </h2>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>

              {/* Vertical line container */}
              <div className="relative border-l border-neutral-800 ml-1.5">
                {section.entries.map((entry, i) => (
                  <TimelineCard key={i} entry={entry} dotColor={section.dotColor} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
