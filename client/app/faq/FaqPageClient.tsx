'use client'

import { useEffect, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, PageHeader } from '@/components/site/layout'
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

function FaqItem({ faq, open, onToggle }: { faq: Faq; open: boolean; onToggle: () => void }) {
  return (
    <li className="rounded-xl border-2 border-ink bg-white px-5 shadow-ink-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="min-w-0">
          {faq.category && <span className="mb-1 block text-xs font-bold text-pen">{faq.category}</span>}
          <span className="block text-base font-semibold text-fg md:text-lg">{faq.question}</span>
        </span>
        <FiChevronDown
          className={`shrink-0 text-fg-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          size={18}
          aria-hidden
        />
      </button>
      {open && <p className="pb-6 text-sm leading-[1.75] text-fg-muted">{faq.answer}</p>}
    </li>
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

  const en = locale === 'en'

  return (
    <PageShell>
      <PageHeader
        title={en ? 'FAQ' : '자주 묻는 질문'}
        description={
          en
            ? 'Answers to the questions I get asked most often about this site.'
            : '이 사이트에 대해 자주 받는 질문을 모아 둡니다.'
        }
        width="reading"
      />
      <Container width="reading">
        <ul className="grid gap-3">
          {faqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              open={openId === faq.id}
              onToggle={() => setOpenId((cur) => (cur === faq.id ? null : faq.id))}
            />
          ))}
        </ul>
      </Container>
    </PageShell>
  )
}
