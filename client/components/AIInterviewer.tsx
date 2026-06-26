'use client'

import { useState, useEffect, useRef } from 'react'
import { FiSend } from 'react-icons/fi'

const PRESET_QUESTIONS = [
  '이 개발자의 강점은?',
  '어떤 프로젝트를 했나요?',
  '팀 협업 스타일은?',
]

function useTypingEffect(text: string, speed = 20) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayed('')
      setDone(false)
      return
    }
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return { displayed, done }
}

export default function AIInterviewer() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { displayed } = useTypingEffect(answer)

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

      if (res.ok && data.reply) {
        setAnswer(data.reply)
      } else {
        setError(data.message ?? '오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    askQuestion(question)
    setQuestion('')
  }

  const handlePreset = (q: string) => {
    setQuestion(q)
    askQuestion(q)
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-indigo-400 text-xl">🤖</span>
          <h2 className="text-xl font-bold text-neutral-100">AI 인터뷰어</h2>
        </div>
        <p className="text-sm text-neutral-400">채용 담당자를 위한 AI 어시스턴트</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-neutral-700 bg-neutral-900 overflow-hidden shadow-2xl">
        {/* Preset buttons */}
        <div className="px-5 pt-5 pb-3 flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handlePreset(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Answer area */}
        <div className="mx-5 mb-4 min-h-[80px] rounded-xl bg-neutral-800/60 border border-neutral-700/50 px-4 py-3">
          {isLoading ? (
            <div className="flex items-center gap-1 h-full pt-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : displayed ? (
            <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{displayed}</p>
          ) : (
            <p className="text-sm text-neutral-500 italic">질문을 선택하거나 직접 입력해보세요.</p>
          )}
        </div>

        {/* Input area */}
        <div className="px-5 pb-5">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="질문을 직접 입력하세요... (Enter로 전송)"
              rows={2}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm placeholder-neutral-500 px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !question.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
              aria-label="전송"
            >
              <FiSend size={16} />
            </button>
          </div>
          <p className="text-[10px] text-neutral-600 text-right mt-2">powered by Gemini</p>
        </div>
      </div>
    </div>
  )
}
