'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
import { FiGithub, FiExternalLink, FiFolder, FiUser, FiCode, FiCalendar } from 'react-icons/fi'
import Link from 'next/link'
import SearchBar from './SearchBar'
import ProjectModal from './portfolio/ProjectModal'
import { useLanguage } from '@/lib/LanguageContext'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import {
  portfolioViewport,
  sectionReveal,
  maskReveal,
  lineReveal,
  staggerContainer,
  staggerItem,
} from '@/lib/portfolioMotion'

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
  retrospective?: string // 기술 선택 이유 / 배운 점
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
    retrospective:
      '게임 로직을 UI와 완전히 분리해 순수 함수로 만든 덕에 테스트와 리팩터링이 쉬웠습니다. 모바일 스와이프 입력을 다루며 터치 이벤트와 키보드 입력을 하나의 상태 모델로 통합하는 법을 배웠습니다.',
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
    retrospective:
      'SEO와 초기 로딩 속도가 중요한 브랜드 사이트라 Next.js의 SSR/SSG를 택했습니다. SCSS 구조를 컴포넌트 단위로 나눠 팀원과 스타일 충돌 없이 협업하는 경험을 쌓았습니다.',
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
    retrospective:
      '여러 백엔드 페이지에 반복 삽입되는 UI를 Web Components로 캡슐화해, 프레임워크에 종속되지 않는 재사용 컴포넌트를 만들었습니다. Svelte의 반응성과 결합해 관리자 화면의 상태 관리를 단순하게 유지했습니다.',
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

// English overrides for the built-in sample projects, keyed by project id.
// DB-sourced projects have no entry and fall back to their stored (Korean) text.
type ProjectEn = Partial<Pick<Project, 'title' | 'description' | 'content' | 'participants' | 'role' | 'retrospective'>>
const PROJECT_EN: Record<string, ProjectEn> = {
  'tetris-web': {
    title: 'Tetris (Web Demo)',
    description: 'Browser-playable Tetris — SRS rotation, hold, mobile gestures',
    content:
      'Built with Next.js and pure TypeScript game logic. Supports 7-bag randomization, ghost piece, per-level gravity and local high scores, with both desktop keyboard and mobile swipe/button input.',
    participants: 'Solo',
    role: 'Design & implementation',
    retrospective:
      'Keeping the game logic fully separate from the UI as pure functions made testing and refactoring easy. Handling mobile swipe input taught me to unify touch and keyboard into a single state model.',
  },
  '1': {
    title: 'BabaOption',
    description: 'Easytros / binary-option brand site',
    content:
      'A brand site for binary options, built with Next.js and Node.js. Applied responsive design and a modern UI/UX to improve the user experience.',
    participants: 'Team project (company)',
    role: 'Full development',
    retrospective:
      'Chose Next.js SSR/SSG because SEO and initial load speed mattered for a brand site. Splitting SCSS by component let the team collaborate without style conflicts.',
  },
  '2': {
    title: 'CRM (Deposit/Withdrawal Management)',
    description: 'CRM site for the BabaOption / Easytros options platform',
    content:
      'A CRM for a binary-option platform that manages deposit and withdrawal operations. Built a modern admin interface with Svelte and Web Components.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
    retrospective:
      'Encapsulated UI repeated across many backend pages into framework-agnostic reusable Web Components. Combined with Svelte reactivity to keep the admin state management simple.',
  },
  '3': {
    title: 'Easytros (Options)',
    description: 'A WTS to trade with coins or currency',
    content:
      'A web trading system for playing options with coins or currency. Implemented interactive game elements with PixiJS and state management with Svelte.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
  },
  '4': {
    title: 'Lalla',
    description: 'AI-based early-childhood growth app',
    content:
      'A web app that uses AI to help kindergartens and parents raise young children more conveniently and effectively. Built a responsive, user-friendly UI on React.',
    participants: 'Solo (freelance)',
    role: 'Publishing & frontend development',
  },
  '4-1': {
    title: 'tzzim',
    description: 'Golf tee-time booking website',
    content:
      'A golf tee-time website that introduces courses and lets users make reservations. Built a responsive, user-friendly UI on React.',
    participants: 'Solo (freelance)',
    role: 'Publishing & frontend development',
  },
  '5': {
    title: 'mytradinginfo / admin',
    description: 'Crypto information site with an admin panel',
    content:
      'A crypto information site built for advertising and customer acquisition around company projects. Developed the responsive design and the admin panel.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
  },
  '6': {
    title: 'mysoftwiz / admin',
    description: 'Company site with an admin panel',
    content:
      'A company introduction site that accepts resumes and inquiries, plus an admin panel to manage them. Implemented server-side rendering with the EJS template engine.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
  },
  '7': {
    title: 'babaglobal',
    description: 'Company homepage for the baba brand',
    content:
      'An in-house company introduction homepage for the baba brand. Handled responsive page publishing and frontend work with Semantic UI.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
  },
  '8': {
    title: 'Shoretech',
    description: 'Swimming-pool introduction site',
    content:
      'A swimming-pool introduction site delivered as a freelance markup-only job. Introduced the pool facilities and services with a clean, intuitive design.',
    participants: 'Freelance project',
    role: 'Markup/publishing',
  },
  '9': {
    title: 'Daejin University Family Companies',
    description: 'Daejin University family-company site',
    content:
      'A freelance markup project for Daejin University family companies. Like other universities, built a family-company site for the assigned school.',
    participants: 'Freelance project',
    role: 'Markup/publishing',
  },
  '10': {
    title: 'Daejeon Mobility Support Center',
    description: 'Mobility support center for people with reduced mobility',
    content:
      'A freelance markup project for a mobility support center serving people with reduced mobility.',
    participants: 'Freelance project',
    role: 'Full markup/publishing',
  },
  '11': {
    title: 'Study PT',
    description: 'Personalized study-training project',
    content:
      'A personalized study-training project delivered as freelance work by two people. Handled all the markup to make studying more convenient for students.',
    participants: '2 people (freelance)',
    role: 'Full markup/publishing',
  },
  '12': {
    title: 'kmuseum',
    description: 'Nationwide museum reservation system',
    content:
      'Worked on kmuseum with two people, handling all the markup. A site to reserve performances, exhibitions and events at museums nationwide, built to make things convenient for visitors.',
    participants: '2 people',
    role: 'Full markup/publishing',
  },
}

/** Apply English overrides (if any) to a project for the given locale. */
function localizeProject(p: Project, locale: 'ko' | 'en'): Project {
  if (locale !== 'en') return p
  const en = PROJECT_EN[p.id]
  return en ? { ...p, ...en } : p
}

const CATEGORIES = [
  { id: 'all', name: '전체', nameEn: 'All' },
  { id: 'web', name: '웹/마켓/스토어', nameEn: 'Web / Market / Store' },
  { id: 'mobile', name: '모바일', nameEn: 'Mobile' },
  { id: 'desktop', name: '데스크톱', nameEn: 'Desktop' },
  { id: 'other', name: '기타', nameEn: 'Other' },
]

function getCaseStudySlug(title: string): string | null {
  if (/tower.?defense/i.test(title)) return 'tower-defense'
  if (/portfolio/i.test(title)) return 'portfolio'
  if (/survive/i.test(title)) return 'survive-game'
  if (/tetris/i.test(title)) return 'tetris'
  return null
}

function formatProjectDate(d: string, locale: 'ko' | 'en' = 'ko') {
  if (!d) return locale === 'en' ? 'Present' : '현재'
  return new Date(d).toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', {
    year: 'numeric',
    month: locale === 'en' ? 'short' : 'long',
  })
}

function ProjectCard({
  project,
  layout,
  onClick,
}: {
  project: Project
  layout: 'track' | 'grid'
  onClick?: () => void
}) {
  const { locale } = useLanguage()
  const en = locale === 'en' ? PROJECT_EN[project.id] : undefined
  const title = en?.title ?? project.title
  const description = en?.description ?? project.description
  const participants = en?.participants ?? project.participants
  const role = en?.role ?? project.role
  const retrospective = en?.retrospective ?? project.retrospective

  const widthClass =
    layout === 'track'
      ? 'min-w-[min(88vw,22rem)] md:min-w-[26rem] snap-start shrink-0'
      : 'w-full'

  return (
    <article
      className={`group flex flex-col h-full border border-neutral-800 rounded-xl bg-neutral-950 overflow-hidden hover:border-neutral-600 transition-colors cursor-pointer ${widthClass}`}
      onClick={onClick}
    >
      <div className="relative h-36 bg-neutral-900 border-b border-neutral-800 overflow-hidden shrink-0">
        <img
          src={project.images[0] || '/images/placeholder.svg'}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder.svg'
          }}
        />
        {project.featured && (
          <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-neutral-600 text-neutral-300 rounded">
            Featured
          </div>
        )}
        <div className="absolute bottom-3 left-4">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium border ${
              project.status === 'completed'
                ? 'border-neutral-600 text-neutral-400'
                : project.status === 'in-progress'
                  ? 'border-neutral-500 text-neutral-300'
                  : 'border-neutral-700 text-neutral-500'
            }`}
          >
            {project.status === 'completed'
              ? locale === 'en' ? 'Done' : '완료'
              : project.status === 'in-progress'
                ? locale === 'en' ? 'In progress' : '진행중'
                : locale === 'en' ? 'Planned' : '계획'}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-3 font-mono">
          <FiCalendar size={11} />
          <span>
            {formatProjectDate(project.startDate, locale === 'en' ? 'en' : 'ko')} — {formatProjectDate(project.endDate, locale === 'en' ? 'en' : 'ko')}
          </span>
        </div>

        <h3 className="text-neutral-100 font-semibold text-lg mb-2 leading-snug group-hover:text-white transition-colors">
          {title}
        </h3>

        <p className="text-neutral-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {(participants || role) && (
          <div className="mb-4 space-y-1">
            {participants && (
              <div className="flex items-center gap-2 text-neutral-600 text-xs">
                <FiUser size={11} />
                <span>{participants}</span>
              </div>
            )}
            {role && (
              <div className="flex items-center gap-2 text-neutral-600 text-xs">
                <FiCode size={11} />
                <span>{role}</span>
              </div>
            )}
          </div>
        )}

        {retrospective && (
          <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              <FiCode size={10} /> {locale === 'en' ? 'Tech retrospective' : '기술 회고'}
            </p>
            <p className="text-xs leading-relaxed text-neutral-400">{retrospective}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {project.technologies.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-xs rounded border border-neutral-800 text-neutral-400"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-neutral-600">
              +{project.technologies.length - 5}
            </span>
          )}
        </div>

        {(project.githubUrl || project.liveUrl) && (
          <div className="flex gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 text-sm font-medium text-neutral-300 border border-neutral-700 hover:border-neutral-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
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
                className="flex-1 py-2 text-sm font-medium text-neutral-950 bg-neutral-100 hover:bg-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <FiExternalLink size={14} />
                Live Demo
              </a>
            )}
          </div>
        )}
        {(() => {
          const slug = getCaseStudySlug(project.title)
          return slug ? (
            <Link
              href={`/portfolio/${slug}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 block text-center text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
            >
              케이스 스터디 보기 →
            </Link>
          ) : null
        })()}
      </div>
    </article>
  )
}

/**
 * eilab-style horizontal track: the row of cards pins to the viewport
 * and translates horizontally as the user scrolls vertically.
 */
function StickyHorizontalTrack({ projects, onCardClick }: { projects: Project[]; onCardClick: (p: Project) => void }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(0)

  useEffect(() => {
    // Measure against the actual clipping viewport's clientWidth, not
    // window.innerWidth — those can differ (scrollbar width, the section's
    // own -mx-4/-mx-6 bleed), and that gap was enough that scrolling all
    // the way to the end of the page still left the last card's edge
    // outside the viewport with no way to reach it. Re-measure via
    // ResizeObserver (not just a window 'resize' listener) so late layout
    // shifts — web fonts swapping in, images loading, earlier sections'
    // reveal animations changing height — can't leave a stale, too-small
    // overflow baked in.
    const measure = () => {
      if (!trackRef.current || !viewportRef.current) return
      // +8px buffer guards against sub-pixel rounding so the last card's
      // edge is never left just outside the clipped viewport.
      const next = Math.max(0, trackRef.current.scrollWidth - viewportRef.current.clientWidth + 8)
      setOverflow((prev) => (prev === next ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    if (viewportRef.current) ro.observe(viewportRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [projects])

  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -overflow])
  const trackTransform = useMotionTemplate`translateX(${x}px)`
  const effectiveOverflow = reduced ? 0 : overflow

  if (projects.length === 0) return null

  // IMPORTANT: always render the same DOM structure regardless of `overflow`.
  // This used to branch into two entirely different JSX trees (a plain row
  // vs. the pinned/scroll-jacked version), which meant sectionRef/trackRef
  // pointed at different DOM nodes depending on state. Framer Motion's
  // useScroll binds its scroll observer to whatever node the ref held when
  // its effect first ran — swapping the underlying node later (via the
  // branch switch) left it tracking stale layout, so the horizontal scroll
  // silently stopped working once real project data measured in. Keeping
  // one persistent tree and only varying height/x by data fixes that, and
  // overflow-x-hidden on the sticky viewport keeps any transient
  // mismeasurement from ever breaking the page-level layout.
  return (
    <div
      ref={sectionRef}
      className="-mx-4 md:-mx-6"
      style={{ height: effectiveOverflow > 0 ? `calc(100vh + ${effectiveOverflow}px)` : undefined }}
    >
      <div
        ref={viewportRef}
        className={
          reduced
            ? 'flex items-center overflow-x-auto'
            : 'sticky top-0 flex h-screen items-center overflow-hidden'
        }
      >
        <motion.div
          ref={trackRef}
          style={{ transform: trackTransform }}
          className="flex w-max gap-5 md:gap-6 px-4 md:px-6"
        >
          {projects.map((project) => (
            <div key={project.id} className="shrink-0">
              <ProjectCard project={project} layout="track" onClick={() => onCardClick(project)} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default function Projects() {
  const { locale } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const useHorizontalTrack = true

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

  if (isLoading) {
    return (
      <section
        id="projects"
        className="relative py-32 flex items-center justify-center border-b border-neutral-800 bg-neutral-950"
      >
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-neutral-700 border-t-neutral-300 animate-spin" />
          <p className="text-neutral-500 text-sm font-mono">프로젝트를 불러오는 중...</p>
        </div>
      </section>
    )
  }

  return (
    <>
    <div className="relative">
      <div className="container-custom relative z-10 pt-28 pb-24">
        <div className="mb-16 max-w-2xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={portfolioViewport}
          >
            <motion.div variants={staggerItem} className="flex items-center gap-3 mb-4">
              <div className="overflow-hidden w-8 h-px">
                <motion.span
                  variants={lineReveal}
                  className="block w-full h-full bg-neutral-600"
                  style={{ originX: 0 }}
                />
              </div>
              <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase">
                Portfolio works
              </span>
            </motion.div>
            <div className="overflow-hidden mb-4">
              <motion.h2 variants={maskReveal} className="text-4xl md:text-5xl font-black text-neutral-50 leading-tight">
                {locale === 'en' ? 'Project' : '프로젝트'}
                <span className="text-neutral-500">{locale === 'en' ? ' Experience' : ' 경험'}</span>
              </motion.h2>
            </div>
            <p className="text-neutral-500 text-base leading-relaxed">
              {locale === 'en'
                ? 'From markup to React, Next.js, and Svelte — work built with a wide range of technologies.'
                : '퍼블리싱부터 React, Next.js, Svelte까지 — 다양한 기술로 완성한 작업물입니다.'}
            </p>
            {useHorizontalTrack && (
              <p className="mt-3 text-neutral-500 text-xs font-mono">
                {locale === 'en' ? '↓ Scroll and cards glide sideways →' : '↓ 스크롤하면 카드가 옆으로 흐릅니다 →'}
              </p>
            )}
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-10 max-w-2xl mx-auto">
          <SearchBar
            onSearch={(q) => setSearchQuery(q)}
            onFilterChange={(f) => setActiveFilters(f)}
            placeholder={locale === 'en' ? 'Search projects, tech stack...' : '프로젝트, 기술 스택 검색...'}
            filters={activeFilters}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-neutral-100 text-neutral-950'
                  : 'border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200'
              }`}
            >
              {locale === 'en' ? cat.nameEn : cat.name}
            </button>
          ))}
        </div>

        {searchQuery && (
          <p className="text-neutral-500 mb-6 text-sm font-mono">
            &ldquo;{searchQuery}&rdquo; — {filteredProjects.length}개
          </p>
        )}

        {filteredProjects.length > 0 ? (
          useHorizontalTrack ? (
            <StickyHorizontalTrack projects={filteredProjects} onCardClick={setSelectedProject} />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={portfolioViewport}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredProjects.map((project) => (
                <motion.div key={project.id} variants={staggerItem}>
                  <ProjectCard project={project} layout="grid" onClick={() => setSelectedProject(project)} />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <FiFolder size={48} className="mx-auto text-neutral-700 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-400 mb-2">프로젝트를 찾을 수 없습니다</h3>
            <p className="text-neutral-600 text-sm">검색어나 필터를 변경해보세요.</p>
          </motion.div>
        )}

        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={portfolioViewport}
          className="mt-14"
        >
          <a
            href="https://github.com/oikikomori/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-700 text-neutral-300 text-sm font-medium hover:border-neutral-500 hover:text-neutral-100 transition-colors"
          >
            <FiGithub size={18} />
            더 많은 프로젝트 보기
          </a>
        </motion.div>
      </div>
    </div>
    {selectedProject && (
      <ProjectModal project={localizeProject(selectedProject, locale === 'en' ? 'en' : 'ko')} onClose={() => setSelectedProject(null)} />
    )}
    </>
  )
}
