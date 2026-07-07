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
        <div className="w-80 h-[480px] flex flex-col rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-neutral-100">{locale === 'en' ? 'Portfolio Assistant' : '포트폴리오 어시스턴트'}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
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
                  className={`max-w-[85%] text-sm rounded-2xl px-3 py-2 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-sm'
                      : 'bg-neutral-800 text-neutral-200 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 text-neutral-400 text-sm rounded-2xl rounded-bl-sm px-3 py-2">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-neutral-700 bg-neutral-800/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={locale === 'en' ? 'Type a message...' : '메시지를 입력하세요...'}
                className="flex-1 bg-neutral-700 text-neutral-100 text-sm placeholder-neutral-500 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-cyan-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl transition-colors"
                aria-label={locale === 'en' ? 'Send' : '전송'}
              >
                <FiSend size={15} />
              </button>
            </div>
            <p className="text-[10px] text-neutral-600 text-right mt-1.5">powered by Claude</p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg flex items-center justify-center transition-colors"
        aria-label={locale === 'en' ? 'Toggle chatbot' : '챗봇 열기/닫기'}
      >
        {isOpen ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>
    </div>
  )
}
