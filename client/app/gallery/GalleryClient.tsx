'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

export interface Project {
  id: string
  title: string
  description: string
  content?: string
  technologies: string[]
  images: string[]
  github_url?: string
  live_url?: string
  category: string
  status: string
}

const DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-1',
    title: 'kuuuma Portfolio',
    description: 'Next.js + Three.js로 만든 인터랙티브 포트폴리오. 3D WebGL 씬, 라이브 커서, 방문자 지구본 등.',
    technologies: ['Next.js', 'Three.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    images: [],
    github_url: 'https://github.com/oikikomori',
    live_url: 'https://kuuuma.com',
    category: 'web',
    status: 'completed',
  },
  {
    id: 'demo-2',
    title: 'Tower Defense Game',
    description: '브라우저에서 플레이 가능한 타워 디펜스 게임. Canvas 기반 렌더링, 글로벌 리더보드.',
    technologies: ['React', 'Canvas API', 'TypeScript', 'PostgreSQL'],
    images: [],
    github_url: '',
    live_url: '/tower-defense',
    category: 'game',
    status: 'completed',
  },
  {
    id: 'demo-3',
    title: 'Survive Game',
    description: '탑다운 슈터 생존 게임. 보스 시스템, 업그레이드 트리, 조이스틱 모바일 지원.',
    technologies: ['React', 'Canvas API', 'WebSocket'],
    images: [],
    github_url: '',
    live_url: '/survive',
    category: 'game',
    status: 'completed',
  },
  {
    id: 'demo-4',
    title: 'AI Blog System',
    description: 'Gemini API 연동 블로그. AI 요약, 번역, 코드 리뷰, RSS/이메일 구독 뉴스레터.',
    technologies: ['Next.js', 'Gemini API', 'PostgreSQL', 'Neon'],
    images: [],
    github_url: '',
    live_url: '/posts',
    category: 'web',
    status: 'completed',
  },
  {
    id: 'demo-5',
    title: 'Typing Speed Game',
    description: '실시간 타이핑 속도 측정 게임. WPM 계산, 정확도 추적, 순위 시스템.',
    technologies: ['React', 'TypeScript', 'PostgreSQL'],
    images: [],
    github_url: '',
    live_url: '/typing-game',
    category: 'game',
    status: 'completed',
  },
  {
    id: 'demo-6',
    title: 'Food Map',
    description: '노션 연동 맛집 리스트. 지역별 필터, Google Maps 임베드, 지도뷰 모드.',
    technologies: ['Next.js', 'Notion API', 'Google Maps'],
    images: [],
    github_url: '',
    live_url: '/food',
    category: 'web',
    status: 'completed',
  },
]

const ProjectGallery = dynamic(() => import('@/components/gallery/ProjectGallery'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#080808] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border border-neutral-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-neutral-600 font-mono text-xs tracking-widest uppercase">Loading Gallery</p>
      </div>
    </div>
  ),
})

export default function GalleryClient() {
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS)

  useEffect(() => {
    fetch('/api/projects/featured?limit=12')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.projects) && d.projects.length > 0) {
          setProjects(d.projects)
        }
      })
      .catch(() => {})
  }, [])

  return <ProjectGallery projects={projects} />
}
