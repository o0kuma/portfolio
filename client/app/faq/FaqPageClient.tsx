'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiChevronDown } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import type { Faq } from '@/lib/notion'

// FAQ content is Korean-only regardless of site locale, matching the
// /recipes and /food content pages — this is site meta-info aimed at
// Korean visitors, not translated marketing copy.
const FALLBACK_FAQS: Faq[] = [
  {
    id: 'about-site',
    category: '사이트 소개',
    question: '이 사이트는 무엇인가요?',
    answer: 'kuuuma.com은 개인 포트폴리오 겸 블로그입니다. 개발 프로젝트, 기술 블로그, 간단한 게임 데모 등을 한곳에 모아둔 공간입니다.',
  },
  {
    id: 'contact',
    category: '연락',
    question: '연락은 어떻게 하나요?',
    answer: '페이지 하단의 Contact 폼을 이용하거나, 헤더/푸터의 이메일 아이콘을 통해 직접 이메일로 연락하실 수 있습니다.',
  },
  {
    id: 'tech-stack',
    category: '기술',
    question: '이 사이트는 어떤 기술로 만들어졌나요?',
    answer: '프론트엔드는 Next.js(React) + TypeScript + Tailwind CSS, 백엔드는 Node.js/Express와 PostgreSQL(Neon)을 사용합니다. 배포는 Vercel에서 이루어집니다.',
  },
  {
    id: 'ai-chatbot',
    category: '기술',
    question: 'AI 챗봇은 어떻게 동작하나요?',
    answer: 'Google Gemini API를 기반으로 동작합니다. API 키가 없는 환경에서는 키워드 기반 템플릿 응답으로 자동 전환되어 항상 동작합니다.',
  },
  {
    id: 'blog-authorship',
    category: '기술',
    question: '블로그 글은 누가 작성하나요?',
    answer: '대부분은 직접 작성하며, 매일 자정에 Vercel Cron이 AI로 자동 생성하는 포스트도 일부 포함되어 있습니다.',
  },
  {
    id: 'source-code',
    category: '기술',
    question: '소스 코드를 볼 수 있나요?',
    answer: '헤더의 GitHub 아이콘을 통해 저장소로 이동하실 수 있습니다. 일부 프로젝트는 비공개일 수 있습니다.',
  },
  {
    id: 'bug-report',
    category: '기타',
    question: '버그를 발견했어요, 어떻게 알려야 하나요?',
    answer: 'Contact 폼이나 이메일로 알려주시면 확인 후 반영하겠습니다. 어떤 페이지에서 발생했는지 구체적으로 적어주시면 큰 도움이 됩니다.',
  },
  {
    id: 'real-projects',
    category: '사이트 소개',
    question: '포트폴리오의 프로젝트들은 실제 서비스인가요?',
    answer: '일부는 실제 운영 중인 서비스이고, 일부는 기술 검증을 위한 토이/데모 프로젝트입니다. 각 프로젝트 상세 페이지에서 구분을 확인하실 수 있습니다.',
  },
]

const CATEGORY_COLOR: Record<string, string> = {
  '사이트 소개': 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  '연락': 'text-green-400 border-green-400/30 bg-green-400/5',
  '기술': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  '기타': 'text-slate-400 border-slate-400/30 bg-slate-400/5',
}

function FaqItem({ faq, open, onToggle }: { faq: Faq; open: boolean; onToggle: () => void }) {
  const catClass = CATEGORY_COLOR[faq.category] ?? 'text-slate-400 border-slate-600 bg-slate-800/50'

  return (
    <div className="rounded-2xl border border-slate-800 bg-canvas/60 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          {faq.category && (
            <span className={`hidden sm:inline-block shrink-0 text-[10px] font-mono px-2 py-0.5 rounded border ${catClass}`}>
              {faq.category}
            </span>
          )}
          <span className="font-semibold text-slate-100 truncate">{faq.question}</span>
        </div>
        <FiChevronDown
          className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          size={18}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{faq.answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FaqPageClient() {
  const { locale } = useLanguage()
  const [faqs, setFaqs] = useState<Faq[]>(FALLBACK_FAQS)
  const [openId, setOpenId] = useState<string | null>(FALLBACK_FAQS[0]?.id ?? null)

  useEffect(() => {
    fetch('/api/faq')
      .then((r) => r.json())
      .then((data: { faqs?: Faq[] }) => {
        if (Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs)
          setOpenId(data.faqs[0].id)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-canvas pb-20 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" /> {locale === 'en' ? 'Home' : '메인으로'}
          </Link>
          <span className="text-sm font-semibold text-slate-200">
            {locale === 'en' ? 'FAQ' : '자주 묻는 질문'}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-10">
        <div className="mb-10 text-center">
          <h1 className="font-display mb-2 text-4xl font-bold">
            {locale === 'en' ? 'FAQ' : '자주 묻는 질문'}
          </h1>
          <p className="text-sm text-slate-500">
            {locale === 'en'
              ? 'Answers to the questions I get asked most often about this site.'
              : '이 사이트에 대해 자주 받는 질문들을 모아뒀습니다.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              open={openId === faq.id}
              onToggle={() => setOpenId((cur) => (cur === faq.id ? null : faq.id))}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
