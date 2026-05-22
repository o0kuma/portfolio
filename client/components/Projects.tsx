'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGithub, FiExternalLink, FiFolder, FiUser, FiCode, FiCalendar } from 'react-icons/fi'
import SearchBar from './SearchBar'

interface Project {
  id: string
  title: string
  description: string
  content: string
  technologies: string[]
  images: string[]
  githubUrl: string
  liveUrl: string
  featured: boolean
  category: string
  startDate: string
  endDate: string
  status: string
  participants?: string
  role?: string
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'tetris-web',
    title: '테트리스 (웹 데모)',
    description: '브라우저에서 플레이하는 테트리스 — SRS 회전, 홀드, 모바일 제스처',
    content:
      'Next.js와 순수 TypeScript 게임 로직으로 구현했습니다. 7-bag 랜덤, 고스트 블록, 레벨별 중력, 로컬 하이스코어를 지원하며 데스크톱 키보드와 모바일 스와이프·버튼 입력을 모두 제공합니다.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '/tetris',
    featured: true,
    category: 'web',
    startDate: '2026-04-01',
    endDate: '',
    status: 'completed',
    participants: '개인',
    role: '기획·구현',
  },
  {
    id: '1',
    title: '바바옵션',
    description: '이지트로스/ 옵션 관련 브랜드 사이트',
    content:
      'Binary Option과 관련된 브랜드 사이트로, Next.js와 Node.js를 활용하여 구축했습니다. 반응형 디자인과 현대적인 UI/UX를 적용하여 사용자 경험을 향상시켰습니다.',
    technologies: ['Next.js', 'Node.js', 'HTML5', 'CSS 3', 'SCSS'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '',
    featured: true,
    category: 'web',
    startDate: '2025-01-01',
    endDate: '2025-03-01',
    status: 'completed',
    participants: '팀 프로젝트(회사)',
    role: '전체 개발 담당',
  },
  {
    id: '2',
    title: 'CRM (입출금 관리 시스템)',
    description: '바바옵션/ 이지트로스/ 옵션 관련 CRM 사이트',
    content:
      'Binary Option 플랫폼에 필요한 CRM 사이트로 입출금 관련 업무를 관리합니다. Svelte와 Web Components를 활용하여 모던한 관리자 인터페이스를 구현했습니다.',
    technologies: ['HTML5', 'Svelte', 'Web Components', 'JavaScript', 'Go'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '',
    featured: true,
    category: 'web',
    startDate: '2023-03-01',
    endDate: '2024-12-31',
    status: 'in-progress',
    participants: '팀 프로젝트(회사)',
    role: '퍼블리싱 및 프론트엔드 개발',
  },
  {
    id: '3',
    title: '이지트로스 (옵션)',
    description: '코인 또는 통화로 게임을 할 수 있는 WTS',
    content:
      '옵션을 통해 코인 또는 통화로 게임을 할 수 있는 웹 트레이딩 시스템입니다. PixiJS를 활용한 인터랙티브한 게임 요소와 Svelte를 통한 상태 관리를 구현했습니다.',
    technologies: ['HTML5', 'PixiJS', 'JavaScript'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '',
    featured: true,
    category: 'web',
    startDate: '2021-05-01',
    endDate: '2024-12-31',
    status: 'completed',
    participants: '팀 프로젝트(회사)',
    role: '퍼블리싱 및 프론트엔드 개발',
  },
  {
    id: '4',
    title: '랄라 (Lalla)',
    description: 'AI 기반 유아 성장 도움 앱',
    content:
      'AI를 활용하여 유치원이나 부모가 유아를 더 편리하고 효과적으로 양육할 수 있도록 도와주는 웹앱입니다. React를 기반으로 한 반응형 UI와 사용자 친화적인 인터페이스를 구현했습니다.',
    technologies: ['HTML5', 'CSS 3', 'React', 'JavaScript'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: 'https://play.google.com/store/apps/details?id=com.lullaapp.android&hl=ko',
    featured: false,
    category: 'mobile',
    startDate: '2022-03-01',
    endDate: '2022-06-01',
    status: 'completed',
    participants: '개인 프로젝트(외주)',
    role: '퍼블리싱 및 프론트엔드 개발',
  },
  {
    id: '4-1',
    title: '티찜 (tzzim)',
    description: '골프 티찜 웹사이트',
    content:
      '골프 티찜 웹사이트로, 골프 티찜을 소개하고 예약을 할 수 있는 웹사이트입니다. React를 기반으로 한 반응형 UI와 사용자 친화적인 인터페이스를 구현했습니다.',
    technologies: ['HTML5', 'CSS 3', 'React', 'JavaScript'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: 'https://apkpure.net/kr/%ED%8B%B0%EC%B0%9C/com.mnemosyne.teezzim_op',
    featured: false,
    category: 'mobile',
    startDate: '2022-06-17',
    endDate: '2022-07-29',
    status: 'completed',
    participants: '개인 프로젝트(외주)',
    role: '퍼블리싱 및 프론트엔드 개발',
  },
  {
    id: '5',
    title: 'mytradinginfo/ admin',
    description: '코인 관련 정보 사이트 및 관리자 페이지',
    content:
      '코인 관련 정보를 제공하는 사이트로, 회사 프로젝트와 관련된 광고 및 고객 모집을 위해 제작되었습니다. 반응형 디자인과 관리자 화면을 개발했습니다.',
    technologies: ['HTML5', 'JavaScript', 'React', 'CSS 3'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: 'https://www.mytradinginfo.com/',
    featured: false,
    category: 'web',
    startDate: '2020-11-01',
    endDate: '2021-03-01',
    status: 'completed',
    participants: '팀 프로젝트(회사)',
    role: '퍼블리싱 및 프론트엔드 개발',
  },
  {
    id: '6',
    title: 'mysoftwiz / admin',
    description: '회사 소개 사이트 및 관리자 페이지',
    content:
      '회사 소개 사이트로 이력서와 문의를 받을 수 있으며, 이를 관리하기 위한 관리자 페이지 작업을 진행했습니다. EJS 템플릿 엔진을 활용한 서버사이드 렌더링을 구현했습니다.',
    technologies: ['HTML5', 'JavaScript', 'EJS'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: 'https://www.mysoftwiz.com/',
    featured: false,
    category: 'web',
    startDate: '2021-03-01',
    endDate: '2021-04-01',
    status: 'completed',
    participants: '팀 프로젝트(회사)',
    role: '퍼블리싱 및 프론트엔드 개발',
  },
  {
    id: '7',
    title: 'babaglobal',
    description: 'baba 브랜드 관련 회사 소개 홈페이지',
    content:
      'baba 브랜드와 관련된 회사 소개 홈페이지를 사내 프로젝트로 개발했습니다. Semantic UI를 활용한 반응형 페이지 퍼블리싱과 프론트엔드 작업을 담당했습니다.',
    technologies: ['HTML5', 'JavaScript', 'CSS 3', 'Semantic UI'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '',
    featured: false,
    category: 'web',
    startDate: '2020-05-01',
    endDate: '2020-07-01',
    status: 'completed',
    participants: '팀 프로젝트(회사)',
    role: '퍼블리싱 및 프론트엔드 개발',
  },
  {
    id: '8',
    title: '쇼어테크 (Shoretech)',
    description: '수영장 소개 사이트',
    content:
      '외주를 받아 퍼블리싱 작업만 진행한 수영장 소개 사이트입니다. 깔끔하고 직관적인 디자인으로 수영장의 시설과 서비스를 효과적으로 소개했습니다.',
    technologies: ['HTML5', 'CSS 3', 'JavaScript'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '',
    featured: false,
    category: 'web',
    startDate: '2020-02-01',
    endDate: '2020-02-28',
    status: 'completed',
    participants: '외주 프로젝트',
    role: '퍼블리싱 작업 담당',
  },
  {
    id: '9',
    title: '대진대학교 가족회사',
    description: '대진대학교 가족회사 사이트',
    content:
      '대진대학교 가족회사를 외주로 받아 퍼블리싱 작업을 진행했습니다. 다른 대학들과 마찬가지로 담당 대학에 대한 가족회사 사이트를 제작했습니다.',
    technologies: ['HTML5', 'CSS 3', 'jQuery'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '',
    featured: false,
    category: 'web',
    startDate: '2020-01-01',
    endDate: '2020-01-31',
    status: 'completed',
    participants: '외주 프로젝트',
    role: '퍼블리싱 작업 담당',
  },
  {
    id: '10',
    title: '대전교통약자이동지원센터',
    description: '교통약자 이동 지원 센터 사이트',
    content:
      '교통약자 이동 지원 센터 사이트로 외주를 받아 퍼블리싱 작업을 진행했습니다. 다른 대학들과 마찬가지로 담당 대학에 대한 가족회사 사이트를 제작했습니다.',
    technologies: ['HTML5', 'CSS 3', 'JavaScript'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: 'https://djcall.or.kr/',
    featured: false,
    category: 'web',
    startDate: '2019-11-20',
    endDate: '2019-12-10',
    status: 'completed',
    participants: '외주 프로젝트',
    role: '전 퍼블리싱 담당',
  },
  {
    id: '11',
    title: '스터디피티 (Study PT)',
    description: '공부 개인 맞춤형 훈련 프로젝트',
    content:
      '공부 개인 맞춤형 훈련 프로젝트로 외주를 받아 작업하였으며, 두 명이 작업을 진행했습니다. 전 퍼블리싱 작업을 담당하여 학생들에게 공부에 대한 편의를 제공하고자 했던 프로젝트입니다.',
    technologies: ['HTML5', 'CSS 3', 'jQuery'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '',
    featured: false,
    category: 'web',
    startDate: '2019-07-01',
    endDate: '2019-08-01',
    status: 'completed',
    participants: '2명 (외주)',
    role: '전 퍼블리싱 작업 담당',
  },
  {
    id: '12',
    title: 'kmuseum',
    description: '전국 박물관 예약 시스템',
    content:
      'kmuseum 프로젝트에 총 두 명이 참여하였고, 전 퍼블리싱을 담당했습니다. 전국 모든 박물관에 공연, 전시, 이벤트 등 예약을 할 수 있는 사이트로 고객들에게 편의를 제공하기 위해 작업했던 프로젝트입니다.',
    technologies: ['HTML5', 'CSS 3', 'PHP'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: '',
    featured: false,
    category: 'web',
    startDate: '2019-04-01',
    endDate: '2019-06-01',
    status: 'completed',
    participants: '2명',
    role: '전 퍼블리싱 담당',
  },
]

const CATEGORIES = [
  { id: 'all', name: '전체' },
  { id: 'web', name: '웹/마켓/스토어' },
  { id: 'mobile', name: '모바일' },
  { id: 'desktop', name: '데스크톱' },
  { id: 'other', name: '기타' },
]

// Gradient palette for card accent strips — ocean-summer colours
const CARD_ACCENTS = [
  'from-cyan-500 to-blue-600',
  'from-teal-400 to-cyan-600',
  'from-sky-500 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-blue-500 to-cyan-400',
  'from-cyan-400 to-sky-600',
]

// Bubble data for the animated ocean bubbles
const BUBBLES = [
  { w: 18, l: '8%', dur: 9, delay: 0 },
  { w: 10, l: '18%', dur: 11, delay: 2 },
  { w: 26, l: '32%', dur: 8, delay: 4 },
  { w: 14, l: '48%', dur: 13, delay: 1 },
  { w: 20, l: '63%', dur: 10, delay: 3 },
  { w: 8,  l: '75%', dur: 7,  delay: 5 },
  { w: 22, l: '85%', dur: 12, delay: 1.5 },
  { w: 12, l: '94%', dur: 9,  delay: 6 },
]

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const mapRow = (row: Record<string, unknown>): Project => {
      const rawImages = Array.isArray(row.images) ? (row.images as string[]) : []
      const images =
        rawImages.length > 0
          ? rawImages.map((img) => (img.startsWith('/') ? img : `/images/${img}`))
          : ['/images/placeholder.svg']

      return {
        id: String(row.id ?? ''),
        title: String(row.title ?? ''),
        description: String(row.description ?? ''),
        content: String(row.content ?? ''),
        technologies: Array.isArray(row.technologies) ? (row.technologies as string[]) : [],
        images,
        githubUrl: String(row.github_url ?? row.githubUrl ?? ''),
        liveUrl: String(row.live_url ?? row.liveUrl ?? ''),
        featured: Boolean(row.featured),
        category: String(row.category ?? 'web'),
        startDate: String(row.start_date ?? row.startDate ?? ''),
        endDate: String(row.end_date ?? row.endDate ?? ''),
        status: String(row.status ?? 'completed'),
        participants: row.participants ? String(row.participants) : undefined,
        role: row.role ? String(row.role) : undefined,
      }
    }

    ;(async () => {
      try {
        const res = await fetch('/api/projects?limit=50')
        const data = await res.json()
        if (!cancelled && res.ok && Array.isArray(data.projects) && data.projects.length > 0) {
          const mapped = (data.projects as Record<string, unknown>[]).map(mapRow)
          const sorted = mapped.sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          )
          setProjects(sorted)
          setFilteredProjects(sorted)
          return
        }
      } catch {
        // fall through to sample data
      }

      if (!cancelled) {
        const sorted = [...SAMPLE_PROJECTS].sort(
          (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        )
        setProjects(sorted)
        setFilteredProjects(sorted)
      }
    })().finally(() => {
      if (!cancelled) setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let filtered = projects

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q)),
      )
    }

    if (activeFilters.status && activeFilters.status !== 'all') {
      filtered = filtered.filter((p) => p.status === activeFilters.status)
    }

    if (activeFilters.dateRange && activeFilters.dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter((p) => {
        const sd = new Date(p.startDate)
        switch (activeFilters.dateRange) {
          case 'this-year':
            return sd.getFullYear() === now.getFullYear()
          case 'last-year':
            return sd.getFullYear() === now.getFullYear() - 1
          case 'this-month':
            return sd.getMonth() === now.getMonth() && sd.getFullYear() === now.getFullYear()
          case 'last-month': {
            const lm = new Date(now.getFullYear(), now.getMonth() - 1)
            return sd.getMonth() === lm.getMonth() && sd.getFullYear() === lm.getFullYear()
          }
          default:
            return true
        }
      })
    }

    setFilteredProjects(filtered)
  }, [projects, selectedCategory, searchQuery, activeFilters])

  const formatDate = (d: string) => {
    if (!d) return '현재'
    return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
  }

  if (isLoading) {
    return (
      <section
        id="projects"
        className="relative overflow-hidden py-32 flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg,#0f172a 0%,#0c4a6e 50%,#0891b2 100%)' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <p className="text-white/60">프로젝트를 불러오는 중...</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="projects"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#0f172a 0%,#0c4a6e 40%,#0891b2 75%,#06b6d4 100%)' }}
    >
      {/* ── Decorative top wave ─────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 pointer-events-none">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 opacity-20">
          <path d="M0,35 C360,70 720,0 1080,35 C1260,53 1380,18 1440,35 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      {/* ── Floating ocean bubbles ───────────────────────────────── */}
      {BUBBLES.map((b, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute bottom-0 rounded-full border border-white/25 bg-white/5 pointer-events-none"
          style={{ width: b.w, height: b.w, left: b.l }}
          animate={{ y: [0, -(620 + i * 30)], opacity: [0, 0.7, 0.4, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="container-custom relative z-10 pt-28 pb-36">

        {/* Section header */}
        <div className="relative text-center mb-20">
          {/* Giant watermark */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[7rem] md:text-[13rem] font-black text-white/[0.03] leading-none select-none pointer-events-none tracking-tighter"
          >
            PROJECTS
          </span>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm mb-8">
              <span>🌊</span> PORTFOLIO WORKS
            </span>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-6">
              프로젝트
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg,#67e8f9 0%,#22d3ee 40%,#34d399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                경험
              </span>
            </h2>

            <p className="text-white/55 text-lg max-w-xl mx-auto leading-relaxed">
              퍼블리싱부터 React, Next.js, Svelte까지 —<br />
              다양한 기술로 완성한 작업물들을 소개합니다.
            </p>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-10 max-w-2xl mx-auto">
          <SearchBar
            onSearch={(q) => setSearchQuery(q)}
            onFilterChange={(f) => setActiveFilters(f)}
            placeholder="프로젝트, 기술 스택 검색..."
            filters={activeFilters}
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-400/50 scale-105'
                  : 'bg-white/10 text-white/70 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:text-white hover:scale-105'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search result count */}
        {searchQuery && (
          <p className="text-center text-white/55 mb-8 text-sm">
            &ldquo;<span className="font-semibold text-cyan-300">{searchQuery}</span>&rdquo; 검색 결과&nbsp;
            <span className="font-semibold text-white">{filteredProjects.length}</span>개
          </p>
        )}

        {/* ── Bento / mosaic project grid ─────────────────────── */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const isWide = index % 6 === 0
                const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]

                return (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 50, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.45, delay: Math.min(index * 0.045, 0.4) }}
                    whileHover={{ y: -14, transition: { duration: 0.25, ease: 'easeOut' } }}
                    className={`group relative flex flex-col ${isWide ? 'lg:col-span-2' : ''}`}
                  >
                    {/* Hover glow halo */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500 pointer-events-none" />

                    <div className="relative flex flex-col h-full bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl overflow-hidden transition-all duration-400 group-hover:border-cyan-400/50 group-hover:bg-white/[0.13]">

                      {/* ── Colour accent strip (image area) ── */}
                      <div className={`relative h-40 bg-gradient-to-br ${accent} overflow-hidden shrink-0`}>
                        {/* Decorative circles inside strip */}
                        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/20" />

                        {/* Project image (if real) */}
                        <img
                          src={project.images[0] || '/images/placeholder.svg'}
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
                          onError={(e) => {
                            e.currentTarget.src = '/images/placeholder.svg'
                          }}
                        />

                        {/* Featured badge */}
                        {project.featured && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold rounded-full">
                            ⭐ Featured
                          </div>
                        )}

                        {/* Status badge */}
                        <div className="absolute bottom-3 left-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              project.status === 'completed'
                                ? 'bg-emerald-400/25 text-emerald-200 border-emerald-400/40'
                                : project.status === 'in-progress'
                                ? 'bg-amber-400/25 text-amber-200 border-amber-400/40'
                                : 'bg-blue-400/25 text-blue-200 border-blue-400/40'
                            }`}
                          >
                            {project.status === 'completed'
                              ? '완료'
                              : project.status === 'in-progress'
                              ? '진행중'
                              : '계획'}
                          </span>
                        </div>

                        {/* Wave ripple on card hover */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-white/10 pointer-events-none"
                          initial={{ scale: 0, opacity: 0.6 }}
                          whileHover={{ scale: 3, opacity: 0 }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          style={{ transformOrigin: '30% 60%' }}
                        />
                      </div>

                      {/* ── Card body ─────────────────────────── */}
                      <div className="flex flex-col flex-1 p-6">

                        {/* Date row */}
                        <div className="flex items-center gap-1.5 text-white/35 text-xs mb-3">
                          <FiCalendar size={11} />
                          <span>{formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
                        </div>

                        <h3 className="text-white font-bold text-xl mb-2 leading-snug group-hover:text-cyan-300 transition-colors duration-300">
                          {project.title}
                        </h3>

                        <p className="text-white/55 text-sm leading-relaxed mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        {/* Participants & role */}
                        {(project.participants || project.role) && (
                          <div className="mb-4 space-y-1">
                            {project.participants && (
                              <div className="flex items-center gap-2 text-white/45 text-xs">
                                <FiUser size={11} />
                                <span>{project.participants}</span>
                              </div>
                            )}
                            {project.role && (
                              <div className="flex items-center gap-2 text-white/45 text-xs">
                                <FiCode size={11} />
                                <span>{project.role}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tech tags */}
                        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                          {project.technologies.slice(0, 5).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-xs rounded-md bg-cyan-400/15 text-cyan-300 border border-cyan-400/25"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 5 && (
                            <span className="px-2 py-0.5 text-xs rounded-md bg-white/10 text-white/45 border border-white/15">
                              +{project.technologies.length - 5}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        {(project.githubUrl || project.liveUrl) && (
                          <div className="flex gap-2">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2.5 text-sm font-medium text-white/75 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                              >
                                <FiGithub size={14} />
                                GitHub
                              </a>
                            )}
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target={project.liveUrl.startsWith('/') ? undefined : '_blank'}
                                rel={project.liveUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
                                className="flex-1 py-2.5 text-sm font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30"
                              >
                                <FiExternalLink size={14} />
                                Live Demo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-white/20 mb-4">
              <FiFolder size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white/45 mb-2">프로젝트를 찾을 수 없습니다</h3>
            <p className="text-white/30 text-sm">검색어나 필터를 변경해보세요.</p>
          </motion.div>
        )}

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="https://github.com/oikikomori/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 hover:border-white/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 transition-all duration-300"
          >
            <FiGithub size={20} />
            더 많은 프로젝트 보기
          </a>
        </motion.div>
      </div>

      {/* ── Bottom wave transitioning to next section ──────────── */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full block h-16 md:h-20"
        >
          <path
            d="M0,40 C240,80 480,10 720,45 C960,80 1200,15 1440,40 L1440,80 L0,80 Z"
            fill="white"
            fillOpacity="0.06"
          />
          <path
            d="M0,55 C360,20 720,70 1080,45 C1260,33 1380,58 1440,50 L1440,80 L0,80 Z"
            fill="white"
            fillOpacity="0.04"
          />
        </svg>
      </div>
    </section>
  )
}
