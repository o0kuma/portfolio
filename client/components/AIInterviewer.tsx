'use client'

import { useState, useEffect, useRef } from 'react'
import { FiSend, FiZap } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'

const PRESET_QUESTIONS = [
  { label: '이 개발자의 강점은?', labelEn: "What are this developer's strengths?", emoji: '💡' },
  { label: '어떤 프로젝트를 했나요?', labelEn: 'What projects have they built?', emoji: '🚀' },
  { label: '팀 협업 스타일은?', labelEn: "What's their team collaboration style?", emoji: '🤝' },
]

function useTypingEffect(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!text) { setDisplayed(''); return }
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return displayed
}

export default function AIInterviewer() {
  const { locale } = useLanguage()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const displayed = useTypingEffect(answer)

  const askQuestion = async (q: string) => {
    const text = q.trim()
    if (!text || isLoading) return

    setIsLoading(true)
    setAnswer('')
    setError('')

    try {
      const res = await fetch('/api/ai-interviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      const data = await res.json() as { reply?: string; message?: string }
      if (res.ok && data.reply) setAnswer(data.reply)
      else setError(data.message ?? (locale === 'en' ? 'Something went wrong.' : '오류가 발생했습니다.'))
    } catch {
      setError(locale === 'en' ? 'A network error occurred.' : '네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    askQuestion(question)
    setQuestion('')
    setActivePreset(null)
  }

  const handlePreset = (q: string) => {
    setActivePreset(q)
    setQuestion(q)
    askQuestion(q)
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-24">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono tracking-widest uppercase">
          <FiZap size={11} />
          powered by Gemini
        </div>
        <h2 className="text-2xl font-bold text-neutral-100 mb-2">{locale === 'en' ? 'AI Interviewer' : 'AI 인터뷰어'}</h2>
        <p className="text-sm text-neutral-500">{locale === 'en' ? 'An AI assistant for recruiters — ask anything right away' : '채용 담당자를 위한 AI 어시스턴트 — 궁금한 점을 바로 물어보세요'}</p>
      </div>

      {/* Preset chips */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {PRESET_QUESTIONS.map(({ label, labelEn, emoji }) => {
          const text = locale === 'en' ? labelEn : label
          return (
          <button
            key={text}
            onClick={() => handlePreset(text)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
              ${activePreset === text
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-indigo-500/60 hover:text-indigo-300 hover:bg-indigo-500/10'
              }`}
          >
            <span>{emoji}</span>
            <span>{text}</span>
          </button>
          )
        })}
      </div>

      {/* Answer card */}
      <AnimatePresence mode="wait">
        {(isLoading || answer || error) && (
          <motion.div
            key={isLoading ? 'loading' : answer ? 'answer' : 'error'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm p-6"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-500">{locale === 'en' ? 'AI is generating a response...' : 'AI가 답변을 생성하고 있습니다...'}</span>
              </div>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : (
              <p className="text-sm text-neutral-200 leading-7 whitespace-pre-wrap">{displayed}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              setActivePreset(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={locale === 'en' ? 'Type your own question...' : '질문을 직접 입력하세요...'}
            rows={1}
            disabled={isLoading}
            className="w-full resize-none rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100 text-sm placeholder-neutral-600 px-5 py-3.5 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-50"
          />
          <span className="absolute right-4 bottom-3 text-[10px] text-neutral-700 font-mono select-none">Enter ↵</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !question.trim()}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={locale === 'en' ? 'Send' : '전송'}
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  )
}
