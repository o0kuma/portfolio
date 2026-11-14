'use client'

import { useState, useRef, useEffect } from 'react'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function getInitialGreeting(): string {
  let lang = 'en'
  try {
    lang = localStorage.getItem('lang') || 'en'
  } catch {
    // localStorage unavailable
  }
  return lang === 'ko'
    ? '안녕하세요! 포트폴리오에 대해 궁금한 것이 있으시면 무엇이든 물어보세요 😊'
    : 'Hi! Ask me anything about this portfolio 😊'
}

export default function ChatbotWidget() {
  const { locale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: getInitialGreeting() },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await res.json() as { reply?: string; message?: string }

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply! }])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message ?? (locale === 'en' ? 'Something went wrong. Please try again shortly.' : '오류가 발생했습니다. 잠시 후 다시 시도해주세요.') },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: locale === 'en' ? 'A network error occurred.' : '네트워크 오류가 발생했습니다.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[480px] w-[min(20rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border border-line-strong bg-panel shadow-lg shadow-black/40">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold text-fg">{locale === 'en' ? 'Ask about this site' : '사이트에 대해 묻기'}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center text-fg-subtle transition-colors hover:text-fg"
              aria-label={locale === 'en' ? 'Close' : '닫기'}
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-[1.6] ${
                    msg.role === 'user' ? 'bg-panel-2 text-fg' : 'border border-line text-fg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-line px-3 py-2 text-sm text-fg-subtle">
                  {locale === 'en' ? 'Writing…' : '답변을 쓰는 중…'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-line px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={locale === 'en' ? 'Type a question' : '질문을 입력하세요'}
                className="h-10 flex-1 rounded-md border border-line bg-night px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-line-strong focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-line-strong text-fg transition-colors hover:bg-panel-2 disabled:opacity-40"
                aria-label={locale === 'en' ? 'Send' : '전송'}
              >
                <FiSend size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-line-strong bg-panel text-fg shadow-lg shadow-black/40 transition-colors hover:bg-panel-2"
        aria-label={locale === 'en' ? 'Toggle chatbot' : '챗봇 열기/닫기'}
      >
        {isOpen ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>
    </div>
  )
}
