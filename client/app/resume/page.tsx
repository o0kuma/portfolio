'use client'
import { useEffect, useRef } from 'react'

const timelineData = {
  경력: [
    { date: '2023.03 ~ 현재', title: '프리랜서 프론트엔드 개발자', org: '자기 주도 프로젝트', desc: '개인 포트폴리오 사이트 개발, 외주 웹 프로젝트 수행' },
    { date: '2022.01 ~ 2023.02', title: '프론트엔드 개발자', org: '스타트업', desc: 'React/Next.js 기반 웹 서비스 개발 및 유지보수' },
  ],
  학력: [
    { date: '2018.03 ~ 2022.02', title: '컴퓨터공학과', org: 'OO대학교', desc: '학사 졸업' },
  ],
  자격증: [
    { date: '2021.11', title: '정보처리기사', org: '한국산업인력공단', desc: '' },
  ],
}

type TimelineItem = {
  date: string
  title: string
  org: string
  desc: string
}

function TimelineItem({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('opacity-100', 'translate-y-0')
            el.classList.remove('opacity-0', 'translate-y-4')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-4 transition-all duration-500 relative pl-8"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Dot on the timeline line */}
      <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-neutral-400" />

      {/* Card */}
      <div className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 hover:border-neutral-700 transition-colors">
        <span className="text-xs font-mono text-neutral-500">{item.date}</span>
        <h3 className="mt-1 text-base font-bold text-neutral-100">{item.title}</h3>
        <p className="text-sm text-neutral-400 mt-0.5">{item.org}</p>
        {item.desc && (
          <p className="mt-2 text-sm text-neutral-500">{item.desc}</p>
        )}
      </div>
    </div>
  )
}

function TimelineSection({ title, items }: { title: string; items: TimelineItem[] }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('opacity-100', 'translate-y-0')
            el.classList.remove('opacity-0', 'translate-y-4')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="mb-16">
      <h2
        ref={headingRef}
        className="opacity-0 translate-y-4 transition-all duration-500 text-lg font-bold text-neutral-300 mb-8 font-mono tracking-widest uppercase"
      >
        {title}
      </h2>
      {/* Vertical timeline */}
      <div className="border-l-2 border-neutral-700 ml-1">
        {items.map((item, i) => (
          <TimelineItem key={`${item.date}-${item.title}`} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}

export default function ResumePage() {
  return (
    <main className="bg-neutral-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-4xl font-black text-neutral-50">이력서</h1>
          <a
            href="/resume.pdf"
            download
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-mono text-neutral-300 hover:border-neutral-500 hover:text-neutral-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF 다운로드
          </a>
        </div>

        {/* Timeline sections */}
        {(Object.entries(timelineData) as [string, TimelineItem[]][]).map(([section, items]) => (
          <TimelineSection key={section} title={section} items={items} />
        ))}
      </div>
    </main>
  )
}
