'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiDownload, FiGithub, FiMail, FiPhone } from 'react-icons/fi'

// ── 실제 이력서 데이터 ────────────────────────────────────────────────────────

const SKILLS = [
  'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Svelte',
  'Node.js', 'MySQL', 'PixiJS', 'jQuery', 'EJS', 'Web Components',
  'Git', 'GitHub', 'GitLab', 'Figma', 'Zeplin', 'Adobe Photoshop', 'Go',
]

const WORK = [
  {
    dateRange: '2025.12.15 ~ 재직 중',
    duration: '',
    title: '프론트엔드 개발',
    organization: '퀀텀에이아이 (Quantum AI)',
    stack: ['React', 'Next.js', 'TypeScript'],
    description: '프론트엔드 개발자로 재직 중입니다.',
  },
  {
    dateRange: '2020.05 ~ 2025.12.05',
    duration: '5년 7개월',
    title: '웹팀 / 대리',
    organization: '(주)소프트위즈',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Svelte', 'GitHub', 'MySQL'],
    description: '프론트엔드 개발자로 화면 구성과 화면에 필요한 데이터 작업을 진행했습니다.',
  },
  {
    dateRange: '2018.12 ~ 2020.02',
    duration: '1년 3개월',
    title: '웹개발팀 / 사원',
    organization: '스마일데이',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'PHP'],
    description: '에이전시 외주를 받아 퍼블리싱, 간단한 그누보드 튜닝 작업을 진행했습니다.',
  },
]

const PROJECTS = [
  {
    dateRange: '2025.01 ~ 2025.03',
    title: 'BABA OPTION',
    subtitle: 'eztross / Binary Option 브랜드 사이트',
    stack: ['Next.js', 'Node.js', 'HTML5', 'CSS3', 'SCSS'],
    description: 'Binary Option 서비스의 공식 브랜드 사이트 개발.',
    url: 'https://www.babaoption.com/en/main',
  },
  {
    dateRange: '2023.03 ~ 진행 중',
    title: 'CRM',
    subtitle: 'babaoption / eztross 입출금 관련 CRM',
    stack: ['HTML5', 'Svelte', 'Web Components', 'JavaScript', 'Go'],
    description: 'babaoption / eztross Binary Option에 필요한 CRM 사이트 (입출금 관련) 개발 및 유지보수 중.',
    url: 'https://www.babaoption.com/userpage/login',
  },
  {
    dateRange: '2021.05 ~ 2024.12',
    title: 'babaoption / eztross / Binary Option',
    subtitle: 'Binary Option 코인·통화 게임 wts',
    stack: ['HTML5', 'PixiJS', 'JavaScript', 'Svelte'],
    description: '통화와 코인으로 up/down 등 게임을 할 수 있는 Binary Option wts 개발.',
  },
  {
    dateRange: '2021.03 ~ 2021.04',
    title: 'mysoftwiz / admin',
    subtitle: '회사 소개 사이트 & 관리자 페이지',
    stack: ['HTML5', 'JavaScript', 'EJS'],
    description: '회사 소개 사이트로 이력서·문의 사항을 받을 수 있는 사이트와 관리자 페이지 개발.',
    url: 'https://www.mysoftwiz.com',
  },
  {
    dateRange: '2020.11 ~ 2021.03',
    title: 'mytradinginfo / admin',
    subtitle: '코인 관련 정보 사이트 & 관리자 페이지',
    stack: ['HTML5', 'JavaScript', 'React', 'CSS3'],
    description: '코인 관련 정보를 제공하는 반응형 사이트 및 관리자 화면 개발.',
    url: 'https://www.mytradinginfo.com',
  },
  {
    dateRange: '2020.05 ~ 2020.07',
    title: 'babaglobal',
    subtitle: 'baba 브랜드 회사 소개 홈페이지',
    stack: ['HTML5', 'JavaScript', 'CSS3', 'Semantic UI'],
    description: '회사 내 프로젝트로 baba 브랜드 회사 소개 홈페이지 퍼블리싱 & 프론트엔드 작업.',
  },
  {
    dateRange: '2022.03 ~ 2022.06',
    title: '랄라',
    subtitle: '유아 성장 AI 앱 웹퍼블리싱',
    stack: ['HTML5', 'CSS3', 'React', 'JavaScript'],
    description: 'AI를 통해 유치원·부모가 아이 성장을 관리하는 웹앱 기반 화면 퍼블리싱.',
  },
  {
    dateRange: '2019.04 ~ 2019.06',
    title: 'kmuseum',
    subtitle: '전국 박물관 공연·전시·이벤트 예약 사이트',
    stack: ['HTML5', 'CSS3', 'PHP'],
    description: '전국 모든 박물관의 공연·전시·이벤트 예약 사이트. 퍼블리싱 담당.',
  },
  {
    dateRange: '2019.07 ~ 2019.08',
    title: '스터디피티',
    subtitle: '공부 개인 맞춤형 훈련 플랫폼',
    stack: ['HTML5', 'CSS3', 'jQuery'],
    description: '학생 맞춤형 공부 훈련 플랫폼. 외주 퍼블리싱 담당.',
  },
  {
    dateRange: '2020.01',
    title: '대진대학교 가족회사',
    subtitle: '대학 가족회사 소개 사이트',
    stack: ['HTML5', 'CSS3', 'jQuery'],
    description: '대진대학교 가족회사 외주 퍼블리싱.',
  },
  {
    dateRange: '2020.02',
    title: '쇼어테크',
    subtitle: '수영장 소개 사이트',
    stack: ['HTML5', 'CSS3', 'JavaScript'],
    description: '수영장 소개 사이트 외주 퍼블리싱.',
  },
]

const EDUCATION = [
  {
    dateRange: '2018.02 졸업',
    title: '한림성심대학교',
    organization: '인터넷비즈니스과 · GPA 3.5 / 4.5',
    description: '대학(2, 3년)',
  },
  {
    dateRange: '2010.02 졸업',
    title: '용문고등학교',
    organization: '',
    description: '',
  },
]

const CERTIFICATIONS = [
  {
    dateRange: '2018.11',
    title: '그래픽기술자격(GTQ) 1급',
    organization: '한국생산성본부(KPC)',
    description: '최종합격',
  },
]

// ── Components ────────────────────────────────────────────────────────────────

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-6 h-px bg-neutral-800" />
      <h2 className={`text-xs font-bold font-mono tracking-[0.2em] uppercase ${color}`}>{label}</h2>
      <div className="flex-1 h-px bg-neutral-800" />
    </div>
  )
}

function StackBadge({ tech }: { tech: string }) {
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-700 text-neutral-500 bg-neutral-900">
      {tech}
    </span>
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
          a[href]::after { content: " (" attr(href) ")"; font-size: 0.75em; color: #555; }
        }
      `}</style>

      <button
        onClick={() => window.print()}
        className="print-hide fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg transition-colors"
      >
        <FiDownload size={15} />
        PDF 다운로드
      </button>

      <main className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-2xl mx-auto px-6 py-20">

          {/* 뒤로가기 */}
          <Link
            href="/portfolio"
            className="print-hide inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 text-xs font-mono mb-10 transition-colors"
          >
            ← 포트폴리오로
          </Link>

          {/* 프로필 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 pb-10 border-b border-neutral-800"
          >
            <p className="text-neutral-600 text-[10px] font-mono tracking-[0.25em] uppercase mb-3">Resume</p>
            <h1 className="text-4xl font-black text-neutral-50 mb-1">오승일</h1>
            <p className="text-indigo-400 font-mono text-sm mb-1">Frontend Developer · Web Publisher</p>
            <p className="text-neutral-600 text-xs font-mono mb-5">개발경력 7년+ · 1990년생</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="mailto:c8c8c81828@gmail.com" className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-100 text-sm transition-colors">
                <FiMail size={14} /> c8c8c81828@gmail.com
              </a>
              <a href="tel:+8205066791577" className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-100 text-sm transition-colors">
                <FiPhone size={14} /> 050-6679-1577
              </a>
              <a href="https://github.com/oikikomori" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-100 text-sm transition-colors">
                <FiGithub size={14} /> oikikomori
              </a>
            </div>
          </motion.div>

          {/* 소개 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <SectionHeader label="소개" color="text-neutral-400" />
            <p className="text-neutral-400 text-sm leading-relaxed">
              퍼블리싱은 누구보다 자신 있습니다. HTML/CSS는 물론 JavaScript와 web component, jQuery, Bootstrap 등
              다양한 UI 컴포넌트 구현에 익숙하며, 반응형 UI 및 상태 기반 인터랙션 구현에도 능숙합니다.
              경력을 쌓으면서 Svelte와 React, Next.js도 활용하여 스킬업과 업무에 반영할 수 있도록 노력하였습니다.
            </p>
          </motion.div>

          {/* 기술 스택 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <SectionHeader label="기술 스택" color="text-cyan-400" />
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <span key={s} className="text-xs font-mono px-2.5 py-1 rounded-full border border-neutral-700 text-neutral-300 bg-neutral-900">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 경력 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <SectionHeader label="경력" color="text-indigo-400" />
            <div className="relative border-l border-neutral-800 ml-1.5 space-y-0">
              {WORK.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative pl-8 pb-8"
                >
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-indigo-400 ring-4 ring-neutral-950 z-10" style={{ transform: 'translateX(-50%)' }} />
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-neutral-500">{w.dateRange}</span>
                      {w.duration && <span className="text-[10px] font-mono text-neutral-700">· {w.duration}</span>}
                    </div>
                    <h3 className="text-neutral-100 font-semibold text-base">{w.organization}</h3>
                    <p className="text-indigo-400 text-sm font-mono mb-3">{w.title}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {w.stack.map((s) => <StackBadge key={s} tech={s} />)}
                    </div>
                    <p className="text-neutral-500 text-sm leading-relaxed">{w.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 프로젝트 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <SectionHeader label="프로젝트" color="text-emerald-400" />
            <div className="relative border-l border-neutral-800 ml-1.5 space-y-0">
              {PROJECTS.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                  className="relative pl-8 pb-6"
                >
                  <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-neutral-950 z-10" style={{ transform: 'translateX(-50%)' }} />
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors">
                    <span className="text-[10px] font-mono text-neutral-600 block mb-1">{p.dateRange}</span>
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="text-neutral-100 font-semibold text-sm">{p.title}</h3>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-mono text-neutral-600 hover:text-indigo-400 transition-colors shrink-0">
                          링크 ↗
                        </a>
                      )}
                    </div>
                    <p className="text-neutral-500 text-xs mb-2">{p.subtitle}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {p.stack.map((s) => <StackBadge key={s} tech={s} />)}
                    </div>
                    <p className="text-neutral-500 text-xs leading-relaxed">{p.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 학력 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <SectionHeader label="학력" color="text-amber-400" />
            <div className="relative border-l border-neutral-800 ml-1.5">
              {EDUCATION.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative pl-8 pb-6"
                >
                  <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-neutral-950 z-10" style={{ transform: 'translateX(-50%)' }} />
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-neutral-600 block mb-1">{e.dateRange}</span>
                    <h3 className="text-neutral-100 font-semibold text-sm">{e.title}</h3>
                    {e.organization && <p className="text-neutral-500 text-xs mt-0.5">{e.organization}</p>}
                    {e.description && <p className="text-neutral-600 text-xs mt-0.5">{e.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 자격증 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <SectionHeader label="자격증" color="text-violet-400" />
            <div className="relative border-l border-neutral-800 ml-1.5">
              {CERTIFICATIONS.map((c, i) => (
                <div key={i} className="relative pl-8 pb-4">
                  <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-violet-400 ring-4 ring-neutral-950 z-10" style={{ transform: 'translateX(-50%)' }} />
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-neutral-600 block mb-1">{c.dateRange}</span>
                    <h3 className="text-neutral-100 font-semibold text-sm">{c.title}</h3>
                    <p className="text-neutral-500 text-xs mt-0.5">{c.organization} · {c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 링크 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <SectionHeader label="링크" color="text-neutral-500" />
            <div className="flex flex-wrap gap-3">
              <a href="https://github.com/oikikomori/portfolio" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 border border-neutral-800 hover:border-neutral-600 px-4 py-2 rounded-lg transition-colors">
                <FiGithub size={14} /> GitHub
              </a>
              <a href="https://kuuuma.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 border border-neutral-800 hover:border-neutral-600 px-4 py-2 rounded-lg transition-colors">
                🌐 포트폴리오
              </a>
            </div>
          </motion.div>

        </div>
      </main>
    </>
  )
}
