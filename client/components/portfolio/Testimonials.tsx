'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, staggerContainer, staggerItem, maskReveal, lineReveal } from '@/lib/portfolioMotion'

type Testimonial = {
  quote: string
  quoteEn: string
  author: string
  role: string
  roleEn: string
  initial: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: '복잡한 요구사항도 명확하게 이해하고 완성도 높은 결과물을 만들어내는 개발자입니다. 특히 UI 디테일에 대한 집착이 남다릅니다.',
    quoteEn: 'A developer who clearly understands complex requirements and delivers high-quality results. Exceptional attention to UI detail.',
    author: '김 프로',
    role: '프로젝트 매니저',
    roleEn: 'Project Manager',
    initial: 'K',
  },
  {
    quote: '일정 내에 반드시 완료하는 책임감과 코드 품질에 대한 높은 기준을 가지고 있습니다. 함께 일하기 좋은 동료입니다.',
    quoteEn: 'Demonstrates strong accountability to meet deadlines and maintains a high standard for code quality. A great team player.',
    author: '이 시니어',
    role: '시니어 개발자',
    roleEn: 'Senior Developer',
    initial: 'L',
  },
  {
    quote: '프론트엔드와 백엔드를 모두 다루면서도 사용자 경험을 항상 최우선으로 고려합니다. 클라이언트 입장에서 최선의 결과를 만들어줍니다.',
    quoteEn: 'Handles both frontend and backend while always prioritizing user experience. Delivers the best outcomes from the client perspective.',
    author: '박 대표',
    role: '스타트업 CEO',
    roleEn: 'Startup CEO',
    initial: 'P',
  },
]

export default function Testimonials() {
  const { locale } = useLanguage()
  const [current, setCurrent] = useState(0)

  return (
    <div className="py-32 border-b border-neutral-800 bg-neutral-950">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={portfolioViewport}
          className="mb-16"
        >
          <motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
            <div className="overflow-hidden w-8 h-px">
              <motion.span variants={lineReveal} className="block w-full h-full bg-neutral-600" style={{ originX: 0 }} />
            </div>
            <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase">
              {locale === 'ko' ? '추천사' : 'Testimonials'}
            </span>
          </motion.div>
          <div className="overflow-hidden">
            <motion.h2 variants={maskReveal} className="text-4xl md:text-5xl font-black text-neutral-50 leading-tight">
              {locale === 'ko' ? (
                <>함께 일한<br /><span className="text-neutral-400">동료들의 이야기</span></>
              ) : (
                <>What colleagues<br /><span className="text-neutral-400">say about me</span></>
              )}
            </motion.h2>
          </div>
        </motion.div>

        {/* Quote */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <p className="text-2xl md:text-3xl font-light text-neutral-300 leading-relaxed mb-8">
                &ldquo;{locale === 'ko' ? TESTIMONIALS[current].quote : TESTIMONIALS[current].quoteEn}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 font-bold text-sm">
                  {TESTIMONIALS[current].initial}
                </div>
                <div>
                  <p className="font-semibold text-neutral-200 text-sm">{TESTIMONIALS[current].author}</p>
                  <p className="text-neutral-600 text-xs font-mono">
                    {locale === 'ko' ? TESTIMONIALS[current].role : TESTIMONIALS[current].roleEn}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav dots */}
          <div className="flex items-center gap-3">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-0.5 transition-all duration-300 ${
                  i === current ? 'w-8 bg-neutral-300' : 'w-4 bg-neutral-700 hover:bg-neutral-600'
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
