/**
 * Portfolio content: projects, career, skills, about lists.
 * Moved out of the old portfolio components so the scrapbook page can
 * render the same data. Text here is the site owner's own content.
 */
import type { AboutInterest, AboutTool } from '@/lib/notion'

export interface Project {
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

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    title: '바바옵션',
    description: '이지트로스/ 옵션 관련 브랜드 사이트',
    content:
      'Binary Option과 관련된 브랜드 사이트로, Next.js와 Node.js를 활용하여 구축했습니다. 반응형 디자인과 현대적인 UI/UX를 적용하여 사용자 경험을 향상시켰습니다.',
    technologies: ['Next.js', 'Node.js', 'HTML5', 'CSS 3', 'SCSS'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: 'https://www.babaoption.com/en',
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
      '옵션을 통해 코인 또는 통화로 게임을 할 수 있는 웹 트레이딩 시스템입니다. PixiJS를 활용해 인터랙티브한 게임 요소를 구현했습니다.',
    technologies: ['HTML5', 'PixiJS', 'JavaScript'],
    images: ['/images/placeholder.svg'],
    githubUrl: '',
    liveUrl: 'https://www.babaoption.com/userpage/login?next=trade',
    featured: true,
    category: 'web',
    startDate: '2021-05-01',
    endDate: '2024-12-31',
    status: 'completed',
    participants: '팀 프로젝트(회사)',
    role: '퍼블리싱 및 프론트엔드 개발',
    retrospective:
      '실시간 시세와 게임 애니메이션이 잦아 DOM 렌더링 대신 PixiJS 캔버스 렌더링을 택해 프레임 드랍을 줄였습니다.',
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
    retrospective:
      '유아 대상 서비스라 복잡한 조작 없이 큰 터치 영역과 직관적인 흐름에 집중했고, React 컴포넌트를 재사용 가능한 단위로 쪼개 화면 추가 요청에 빠르게 대응했습니다.',
  },
  {
    id: '4-1',
    title: '티찜 (tzzim)',
    description: '골프 티찜 웹사이트',
    content:
      '골프 티찜 웹사이트로, 골프 티찜을 소개하고 예약을 할 수 있는 웹사이트입니다. React를 기반으로 한 반응형 UI와 사용자 친화적인 인터페이스를 구현했습니다.',
    technologies: ['HTML5', 'CSS 3', 'React', 'JavaScript'],
    images: ['/images/tzzim.png'],
    githubUrl: '',
    liveUrl: 'https://apkpure.net/kr/%ED%8B%B0%EC%B0%9C/com.mnemosyne.teezzim_op',
    featured: false,
    category: 'mobile',
    startDate: '2022-06-17',
    endDate: '2022-07-29',
    status: 'completed',
    participants: '개인 프로젝트(외주)',
    role: '퍼블리싱 및 프론트엔드 개발',
    retrospective:
      '예약 단계별 폼 상태가 복잡해 React state로 관리했고, 모바일에서 먼저 확인하는 사용자가 많아 모바일 퍼스트로 반응형을 설계했습니다.',
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
    retrospective:
      '관리자 페이지에 반복되는 테이블/필터 UI를 컴포넌트로 분리해 재사용했고, 반응형으로 구현해 다양한 화면에서 확인할 수 있게 했습니다.',
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
    retrospective:
      '이력서·문의 폼 제출이 핵심이라 EJS 서버사이드 렌더링으로 폼 처리와 SEO를 단순하게 가져갔습니다.',
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
    retrospective:
      '사내 브랜드 가이드에 맞춰 Semantic UI 그리드로 빠르게 반응형 퍼블리싱을 완료했습니다.',
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
    retrospective:
      '순수 퍼블리싱 작업으로, 시멘틱 마크업과 크로스 브라우저 호환성에 집중했습니다.',
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
    retrospective:
      '여러 대학 사이트에 반복되는 구조를 jQuery로 모듈화해 유지보수하기 쉽게 만들었습니다.',
  },
  {
    id: '10',
    title: '대전교통약자이동지원센터',
    description: '교통약자 이동 지원 센터 사이트',
    content:
      '교통약자 이동 지원 센터 사이트로 외주를 받아 퍼블리싱 작업을 진행했습니다. 다른 대학들과 마찬가지로 담당 대학에 대한 가족회사 사이트를 제작했습니다.',
    technologies: ['HTML5', 'CSS 3', 'JavaScript'],
    images: ['/images/dj_1.jpg'],
    githubUrl: '',
    liveUrl: 'https://djcall.or.kr/',
    featured: false,
    category: 'web',
    startDate: '2019-11-20',
    endDate: '2019-12-10',
    status: 'completed',
    participants: '외주 프로젝트',
    role: '전 퍼블리싱 담당',
    retrospective:
      '공공기관 사이트 특성상 스크린 리더 대응 등 웹 접근성을 신경 써서 시멘틱 마크업을 작성했습니다.',
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
    retrospective:
      '외주로 받은 프로젝트라 2인 협업 중 CSS 네이밍 컨벤션을 맞춰 충돌 없이 작업했고, jQuery로 폼 인터랙션을 처리했습니다.',
  },
  {
    id: '12',
    title: 'kmuseum',
    description: '전국 박물관 예약 시스템',
    content:
      'kmuseum 프로젝트에 총 두 명이 참여하였고, 전 퍼블리싱을 담당했습니다. 전국 모든 박물관에 공연, 전시, 이벤트 등 예약을 할 수 있는 사이트로 고객들에게 편의를 제공하기 위해 작업했던 프로젝트입니다.',
    technologies: ['HTML5', 'CSS 3', 'PHP'],
    images: ['/images/kmuseum_1.jpg', '/images/kmuseum_2.jpg', '/images/kmuseum_3.jpg'],
    githubUrl: '',
    liveUrl: 'https://www.kmcaseoul.org/',
    featured: false,
    category: 'web',
    startDate: '2019-04-01',
    endDate: '2019-06-01',
    status: 'completed',
    participants: '2명',
    role: '전 퍼블리싱 담당',
    retrospective:
      '예약 캘린더 UI를 PHP 템플릿과 연동되는 구조로 퍼블리싱했습니다.',
  },
]

// English overrides for the built-in sample projects, keyed by project id.
// DB-sourced projects have no entry and fall back to their stored (Korean) text.
type ProjectEn = Partial<Pick<Project, 'title' | 'description' | 'content' | 'participants' | 'role' | 'retrospective'>>
const PROJECT_EN: Record<string, ProjectEn> = {
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
      'A web trading system for playing options with coins or currency. Implemented interactive game elements with PixiJS.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
    retrospective:
      'Real-time prices and game animations updated constantly, so I chose PixiJS canvas rendering over the DOM to avoid dropped frames.',
  },
  '4': {
    title: 'Lalla',
    description: 'AI-based early-childhood growth app',
    content:
      'A web app that uses AI to help kindergartens and parents raise young children more conveniently and effectively. Built a responsive, user-friendly UI on React.',
    participants: 'Solo (freelance)',
    role: 'Publishing & frontend development',
    retrospective:
      'Since this served young children, I focused on large touch targets and simple flows over complex controls, and split React components into reusable units to move fast on new screen requests.',
  },
  '4-1': {
    title: 'tzzim',
    description: 'Golf tee-time booking website',
    content:
      'A golf tee-time website that introduces courses and lets users make reservations. Built a responsive, user-friendly UI on React.',
    participants: 'Solo (freelance)',
    role: 'Publishing & frontend development',
    retrospective:
      'The multi-step reservation form had complex state, so I managed it with React state, and designed mobile-first since most users checked bookings from their phones.',
  },
  '5': {
    title: 'mytradinginfo / admin',
    description: 'Crypto information site with an admin panel',
    content:
      'A crypto information site built for advertising and customer acquisition around company projects. Developed the responsive design and the admin panel.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
    retrospective:
      'Split the admin panel\'s repeated table/filter UI into reusable components, and made it responsive so it worked across different screens.',
  },
  '6': {
    title: 'mysoftwiz / admin',
    description: 'Company site with an admin panel',
    content:
      'A company introduction site that accepts resumes and inquiries, plus an admin panel to manage them. Implemented server-side rendering with the EJS template engine.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
    retrospective:
      'Since resume and inquiry submissions were the core flow, I kept form handling and SEO simple with EJS server-side rendering.',
  },
  '7': {
    title: 'babaglobal',
    description: 'Company homepage for the baba brand',
    content:
      'An in-house company introduction homepage for the baba brand. Handled responsive page publishing and frontend work with Semantic UI.',
    participants: 'Team project (company)',
    role: 'Publishing & frontend development',
    retrospective:
      'Followed the in-house brand guide and used Semantic UI\'s grid to ship responsive publishing quickly.',
  },
  '8': {
    title: 'Shoretech',
    description: 'Swimming-pool introduction site',
    content:
      'A swimming-pool introduction site delivered as a freelance markup-only job. Introduced the pool facilities and services with a clean, intuitive design.',
    participants: 'Freelance project',
    role: 'Markup/publishing',
    retrospective:
      'A pure markup job, so I focused on semantic markup and cross-browser compatibility.',
  },
  '9': {
    title: 'Daejin University Family Companies',
    description: 'Daejin University family-company site',
    content:
      'A freelance markup project for Daejin University family companies. Like other universities, built a family-company site for the assigned school.',
    participants: 'Freelance project',
    role: 'Markup/publishing',
    retrospective:
      'Modularized the structure repeated across multiple university sites with jQuery to keep it maintainable.',
  },
  '10': {
    title: 'Daejeon Mobility Support Center',
    description: 'Mobility support center for people with reduced mobility',
    content:
      'A freelance markup project for a mobility support center serving people with reduced mobility.',
    participants: 'Freelance project',
    role: 'Full markup/publishing',
    retrospective:
      'Being a public-sector site, I paid close attention to web accessibility — screen reader support and semantic markup.',
  },
  '11': {
    title: 'Study PT',
    description: 'Personalized study-training project',
    content:
      'A personalized study-training project delivered as freelance work by two people. Handled all the markup to make studying more convenient for students.',
    participants: '2 people (freelance)',
    role: 'Full markup/publishing',
    retrospective:
      'A freelance project done with one other person, so we agreed on a CSS naming convention to avoid conflicts, and I handled form interactions with jQuery.',
  },
  '12': {
    title: 'kmuseum',
    description: 'Nationwide museum reservation system',
    content:
      'Worked on kmuseum with two people, handling all the markup. A site to reserve performances, exhibitions and events at museums nationwide, built to make things convenient for visitors.',
    participants: '2 people',
    role: 'Full markup/publishing',
    retrospective:
      'Built the reservation calendar UI as markup wired into the PHP templates.',
  },
}

/** Apply English overrides (if any) to a project for the given locale. */
export function localizeProject(p: Project, locale: 'ko' | 'en'): Project {
  if (locale !== 'en') return p
  const en = PROJECT_EN[p.id]
  return en ? { ...p, ...en } : p
}

export const PROJECT_CATEGORIES = [
  { id: 'all', name: '전체', nameEn: 'All' },
  { id: 'web', name: '웹/마켓/스토어', nameEn: 'Web / Market / Store' },
  { id: 'mobile', name: '모바일', nameEn: 'Mobile' },
  { id: 'desktop', name: '데스크톱', nameEn: 'Desktop' },
  { id: 'other', name: '기타', nameEn: 'Other' },
]

export function getCaseStudySlug(title: string): string | null {
  if (/tower.?defense/i.test(title)) return 'tower-defense'
  if (/portfolio/i.test(title)) return 'portfolio'
  if (/survive/i.test(title)) return 'survive-game'
  if (/tetris/i.test(title)) return 'tetris'
  return null
}

export function formatProjectDate(d: string, locale: 'ko' | 'en' = 'ko') {
  if (!d) return locale === 'en' ? 'Present' : '현재'
  return new Date(d).toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', {
    year: 'numeric',
    month: locale === 'en' ? 'short' : 'long',
  })
}

export type TimelineItem = {
  year: string
  period: string
  periodEn: string
  company: string
  companyEn: string
  role: string
  roleEn: string
  type: 'work' | 'education'
  highlights: string[]
  highlightsEn: string[]
  tech?: string[]
  /** One-line "why/how" reflection on the role — mirrors the per-project
   *  tech retrospectives in Projects.tsx so career history isn't just a
   *  task list. */
  note?: string
  noteEn?: string
}

export const TIMELINE: TimelineItem[] = [
  {
    year: '2025',
    period: '2025.12 — 현재',
    periodEn: '2025.12 — Present',
    company: 'Quantum-AI',
    companyEn: 'Quantum-AI',
    role: 'Frontend Developer',
    roleEn: 'Frontend Developer',
    type: 'work',
    highlights: [
      '프론트엔드 개발',
      '프론트엔드 아키텍처 설계 및 구현',
      'UI/UX 기획 및 퍼블리싱',
    ],
    highlightsEn: [
      'Frontend development',
      'Frontend architecture design and implementation',
      'UI/UX planning and markup',
    ],
    tech: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS'],
    note: '프론트엔드 아키텍처를 처음부터 설계하는 역할을 맡아, Next.js와 TypeScript 기반으로 기준을 잡아가는 중입니다.',
    noteEn:
      "Taking on frontend architecture from the ground up, establishing conventions with Next.js and TypeScript.",
  },
  {
    year: '2020',
    period: '2020.05 — 2025.12',
    periodEn: '2020.05 — 2025.12',
    company: '(주)소프트위즈',
    companyEn: 'Softwiz Inc.',
    role: '웹팀 / 대리',
    roleEn: 'Web team / Assistant Manager',
    type: 'work',
    highlights: [
      'Next.js 기반 브랜드 사이트 구축 (BABA OPTION)',
      'Svelte + Web Components CRM 개발',
      'PixiJS 기반 트레이딩 UI 개발',
      'MySQL 연동 사내 관리 시스템 개발',
    ],
    highlightsEn: [
      'Built a Next.js-based brand site (BABA OPTION)',
      'Developed a Svelte + Web Components CRM',
      'Built a PixiJS-based trading UI',
      'Developed an internal management system with MySQL',
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Svelte', 'PixiJS', 'MySQL'],
    note: 'SSR이 필요한 브랜드 사이트엔 Next.js, 반복되는 관리자 UI엔 프레임워크 독립적인 Web Components, 실시간 렌더링이 잦은 화면엔 PixiJS 캔버스를 쓰는 식으로 상황에 맞는 기술을 골라 프론트엔드를 이끌었습니다.',
    noteEn:
      'Picked the tool to fit the situation — Next.js for SSR-heavy brand sites, framework-agnostic Web Components for repeated admin UI, and PixiJS canvas rendering for screens updating in real time.',
  },
  {
    year: '2018',
    period: '2018.12 — 2020.02',
    periodEn: '2018.12 — 2020.02',
    company: '스마일데이',
    companyEn: 'SmileDay',
    role: '웹개발팀 / 사원',
    roleEn: 'Web dev team / Staff',
    type: 'work',
    highlights: [
      '에이전시 외주 퍼블리싱 작업',
      '반응형 웹 UI 제작',
      'jQuery 기반 인터랙션 및 그누보드 튜닝',
    ],
    highlightsEn: [
      'Agency outsourced markup work',
      'Built responsive web UIs',
      'jQuery-based interactions and Gnuboard tuning',
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'PHP'],
    note: '여러 외주 프로젝트를 거치며 크로스 브라우저 호환성과 웹 접근성을 지키는 시멘틱 마크업 습관을 다졌습니다.',
    noteEn:
      'Working across many freelance projects built the habit of writing semantic markup that holds up cross-browser and stays accessible.',
  },
]

export type Skill = { name: string; level: number }  // level 0-100

export type SkillCategory = {
  id: string
  label: string
  labelKo: string
  desc: string
  descKo: string
  color: string
  barColor: string    // tailwind bg color for the progress bar
  accent: string
  skills: Skill[]
}

export const DEFAULT_SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'publishing',
    label: 'Publishing',
    labelKo: '퍼블리싱',
    desc: 'HTML · CSS · Markup',
    descKo: '마크업 · 스타일링',
    color: 'text-orange-400',
    barColor: 'bg-orange-400',
    accent: 'border-orange-400/20 bg-orange-400/5 text-orange-200/80',
    skills: [
      { name: 'HTML5',        level: 98 },
      { name: 'CSS3',         level: 95 },
      { name: 'SCSS',         level: 90 },
      { name: 'Tailwind CSS', level: 92 },
      { name: 'Bootstrap',    level: 85 },
      { name: 'Semantic UI',  level: 75 },
      { name: 'Web Components', level: 70 },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    labelKo: '프론트엔드',
    desc: 'UI Frameworks · SPA · SSR',
    descKo: 'UI 프레임워크 · SPA · SSR',
    color: 'text-cyan-400',
    barColor: 'bg-cyan-400',
    accent: 'border-cyan-400/20 bg-cyan-400/5 text-cyan-200/80',
    skills: [
      { name: 'JavaScript', level: 95 },
      { name: 'TypeScript', level: 88 },
      { name: 'React',      level: 93 },
      { name: 'Next.js',    level: 90 },
      { name: 'Svelte',     level: 82 },
      { name: 'jQuery',     level: 85 },
      { name: 'EJS',        level: 72 },
      { name: 'PixiJS',     level: 65 },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    labelKo: '백엔드',
    desc: 'Server · API · Runtime',
    descKo: '서버 · API · 런타임',
    color: 'text-emerald-400',
    barColor: 'bg-emerald-400',
    accent: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-200/80',
    skills: [
      { name: 'Node.js',     level: 85 },
      { name: 'Express',     level: 83 },
      { name: 'Java',        level: 72 },
      { name: 'Spring Boot', level: 68 },
      { name: 'Go',          level: 62 },
      { name: 'Python',      level: 60 },
      { name: 'PHP',         level: 65 },
      { name: 'REST API',    level: 90 },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    labelKo: '데이터베이스',
    desc: 'RDBMS · NoSQL',
    descKo: '관계형 · 비관계형 DB',
    color: 'text-violet-400',
    barColor: 'bg-violet-400',
    accent: 'border-violet-400/20 bg-violet-400/5 text-violet-200/80',
    skills: [
      { name: 'PostgreSQL', level: 82 },
      { name: 'MySQL',      level: 80 },
      { name: 'MongoDB',    level: 72 },
    ],
  },
  {
    id: 'devtools',
    label: 'Dev Tools',
    labelKo: '개발 도구',
    desc: 'Version Control · Build · CI',
    descKo: '버전 관리 · 빌드 · CI',
    color: 'text-amber-400',
    barColor: 'bg-amber-400',
    accent: 'border-amber-400/20 bg-amber-400/5 text-amber-200/80',
    skills: [
      { name: 'Git',     level: 90 },
      { name: 'GitHub',  level: 88 },
      { name: 'GitLab',  level: 82 },
      { name: 'Webpack', level: 72 },
      { name: 'Vite',    level: 78 },
    ],
  },
  {
    id: 'design',
    label: 'Design & PM',
    labelKo: '디자인 · 협업',
    desc: 'UI Design · Project Mgmt',
    descKo: 'UI 디자인 · 프로젝트 관리',
    color: 'text-pink-400',
    barColor: 'bg-pink-400',
    accent: 'border-pink-400/20 bg-pink-400/5 text-pink-200/80',
    skills: [
      { name: 'Figma',            level: 85 },
      { name: 'Zeplin',           level: 78 },
      { name: 'Adobe Photoshop',  level: 70 },
      { name: 'Confluence',       level: 80 },
      { name: 'Jira',             level: 82 },
      { name: 'Redmine',          level: 75 },
    ],
  },
]

export const FALLBACK_INTERESTS: AboutInterest[] = [
  { ko: 'Three.js WebGL', en: 'Three.js WebGL' },
  { ko: 'AI 통합', en: 'AI integration' },
  { ko: '게임 개발', en: 'Game development' },
  { ko: '성능 최적화', en: 'Performance optimization' },
  { ko: '풀스택', en: 'Full-stack' },
]

export const FALLBACK_TOOLS: AboutTool[] = [
  { name: 'VS Code', icon: '⌨️' },
  { name: 'Cursor', icon: '✦' },
  { name: 'Figma', icon: '◈' },
  { name: 'Vercel', icon: '▲' },
  { name: 'Neon DB', icon: '⬡' },
  { name: 'GitHub', icon: '◯' },
]

/** Public contact details shown on the portfolio. */
export const CONTACT_PHONE = { display: '050-6679-1577', tel: '+8205066791577' }
