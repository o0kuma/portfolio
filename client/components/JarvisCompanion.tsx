'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const sectionMessages: Record<string, string[]> = {
  home: [
    '안녕하세요! 포트폴리오를 둘러보고 계신가요? 🤖',
    '궁금한 점이 있으시면 언제든 물어보세요.',
    '저는 쿠마입니다. 무엇을 도와드릴까요?',
  ],
  about: [
    '개발자에 대해 더 알고 싶으신가요?',
    '직접 연락해보시는 건 어떨까요?',
    '개발자 소개 섹션을 보고 계시네요!',
  ],
  skills: [
    'React와 Next.js가 주력 스택이에요.',
    '풀스택 개발 경험이 있답니다.',
    '다양한 기술 스택을 다루고 있어요.',
  ],
  projects: [
    '이 프로젝트들은 직접 만든 것들이에요.',
    '데모가 궁금하시면 클릭해보세요!',
    '어떤 프로젝트가 가장 흥미로우세요?',
  ],
  posts: [
    '기술 블로그를 운영 중이에요.',
    '어떤 주제가 궁금하신가요?',
    '새로운 글이 자주 업데이트돼요!',
  ],
  games: [
    '게임도 직접 개발했어요!',
    '테트리스, 서바이브, 타워 디펜스가 있어요.',
    '한번 플레이해보시겠어요?',
  ],
  food: [
    '맛집 리스트를 Notion으로 관리해요.',
    '추천 맛집이 필요하세요?',
    '맛있는 곳들만 골라놨어요!',
  ],
  contact: [
    '프로젝트 협업을 원하시나요?',
    '이메일로 연락주시면 답장드릴게요!',
    '언제든지 연락해 주세요!',
  ],
  admin: [
    '관리자 페이지에 오셨군요.',
    '무엇을 관리하시려고요?',
  ],
}

const chips = ['어떤 프로젝트가 있나요?', '연락 방법은?', '어떤 기술 써요?']

export default function JarvisCompanion() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const targetPos = useRef({ x: -100, y: -100 })
  const currentPos = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number>()

  const [bubble, setBubble] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSection, setCurrentSection] = useState('home')

  const lastMoveRef = useRef(Date.now())
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const sectionTimerRef = useRef<ReturnType<typeof setInterval>>()
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const showBubble = useCallback((text: string) => {
    setBubble(text)
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current)
    bubbleTimeoutRef.current = setTimeout(() => setBubble(null), 5000)
  }, [])

  // Smooth mouse follow with lerp
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX + 20, y: e.clientY - 20 }
      lastMoveRef.current = Date.now()
    }
    window.addEventListener('mousemove', onMove)

    const animate = () => {
      const lerp = 0.08
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp
      setPos({ x: currentPos.current.x, y: currentPos.current.y })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Idle wander behavior
  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (Date.now() - lastMoveRef.current > 10000) {
        const x = Math.random() * (window.innerWidth - 100) + 50
        const y = Math.random() * (window.innerHeight - 100) + 50
        targetPos.current = { x, y }
      }
    }, 5000)
    return () => clearInterval(checkIdle)
  }, [])

  // Section detection
  useEffect(() => {
    const detectSection = () => {
      const path = window.location.pathname
      if (path.startsWith('/posts')) return 'posts'
      if (path.startsWith('/food')) return 'food'
      if (path.startsWith('/games')) return 'games'
      if (path.startsWith('/admin')) return 'admin'
      return null
    }

    const pathSection = detectSection()
    if (pathSection) {
      setCurrentSection(pathSection)
      return
    }

    const sectionIds = ['about', 'skills', 'projects', 'contact']
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentSection(id)
          }
        },
        { threshold: 0.4 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    // Fallback: if no section is intersecting, default to home
    const homeCheck = setTimeout(() => {
      setCurrentSection((prev) => prev)
    }, 500)

    return () => {
      observers.forEach((o) => o.disconnect())
      clearTimeout(homeCheck)
    }
  }, [])

  // Proactive messages on section change
  useEffect(() => {
    if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)

    const msgs = sectionMessages[currentSection] || sectionMessages.home
    const randomMsg = () => msgs[Math.floor(Math.random() * msgs.length)]

    const initialTimer = setTimeout(() => {
      showBubble(randomMsg())
      sectionTimerRef.current = setInterval(
        () => {
          showBubble(randomMsg())
        },
        45000 + Math.random() * 15000
      )
    }, 5000)

    return () => {
      clearTimeout(initialTimer)
      if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)
    }
  }, [currentSection, showBubble])

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = text || input
      if (!content.trim() || loading) return

      const userMsg = { role: 'user', content }
      setMessages((prev) => [...prev].slice(-4).concat(userMsg))
      setInput('')
      setLoading(true)

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            sessionId: 'kuuma',
            conversationHistory: messages.slice(-6),
          }),
        })
        const data = await res.json()
        const reply = data.message || data.content || data.reply || '죄송해요, 응답을 받지 못했어요.'
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      } catch {
        setMessages((prev) => [...prev, { role: 'assistant', content: '연결에 문제가 생겼어요. 다시 시도해주세요.' }])
      } finally {
        setLoading(false)
      }
    },
    [input, loading, messages]
  )

  return (
    <>
      <style>{`
        @keyframes kuuma-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes kuuma-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.85); }
        }
        @keyframes kuuma-breathe {
          0%, 100% { box-shadow: 0 0 8px rgb(34 211 238), 0 0 20px rgb(34 211 238 / 0.5); }
          50% { box-shadow: 0 0 16px rgb(34 211 238), 0 0 40px rgb(34 211 238 / 0.8); }
        }
        .kuuma-spin { animation: kuuma-spin 10s linear infinite; }
        .kuuma-pulse-core { animation: kuuma-pulse 2s ease-in-out infinite; }
        .kuuma-breathe { animation: kuuma-breathe 3s ease-in-out infinite; }
      `}</style>

      <div
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          pointerEvents: 'auto',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Speech bubble */}
        {bubble && !isOpen && (
          <div
            className="absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-sm"
            style={{ boxShadow: '0 0 10px rgb(34 211 238 / 0.2)', maxWidth: '220px', whiteSpace: 'normal' }}
          >
            {bubble}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-cyan-500/50 rotate-45" />
          </div>
        )}

        {/* Character rings */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="relative w-12 h-12 flex items-center justify-center"
          aria-label="Toggle 쿠마 chat"
          style={{ outline: 'none' }}
        >
          {/* Spinning outer ring */}
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/40 kuuma-spin"
          />
          {/* Inner glow ring */}
          <div
            className="absolute inset-1.5 rounded-full border border-cyan-400/60 bg-cyan-950/80 backdrop-blur-sm"
            style={{ boxShadow: '0 0 12px rgb(34 211 238 / 0.5), inset 0 0 8px rgb(34 211 238 / 0.2)' }}
          />
          {/* Core */}
          <div
            className="w-3 h-3 rounded-full bg-cyan-400 kuuma-pulse-core relative z-10 kuuma-breathe"
          />
          {/* Tick marks at 4 positions */}
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute w-1 h-1 bg-cyan-400/80 rounded-full"
              style={{ transform: `rotate(${deg}deg) translateX(22px)` }}
            />
          ))}
        </button>

        {/* Chat panel */}
        {isOpen && (
          <div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 bg-black/95 border border-cyan-500/30 rounded-sm font-mono"
            style={{ boxShadow: '0 0 30px rgb(34 211 238 / 0.15)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20">
              <span className="text-cyan-400 text-xs tracking-widest">쿠마</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-cyan-600 hover:text-cyan-400 text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="h-40 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <div className="text-cyan-700 text-xs text-center mt-8">무엇이든 물어보세요</div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-xs ${m.role === 'user' ? 'text-right text-neutral-300' : 'text-left text-cyan-300'}`}
                >
                  <span
                    className={`inline-block px-2 py-1 ${
                      m.role === 'user'
                        ? 'bg-neutral-800'
                        : 'bg-cyan-950/50 border border-cyan-500/20'
                    } rounded-sm`}
                  >
                    {m.content}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="text-cyan-500 text-xs animate-pulse">처리 중...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick chips */}
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => sendMessage(c)}
                  className="text-xs border border-cyan-500/30 text-cyan-500 hover:bg-cyan-950/50 px-2 py-0.5 rounded-sm transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex border-t border-cyan-500/20">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="질문하기..."
                className="flex-1 bg-transparent text-xs text-cyan-300 placeholder-cyan-800 px-3 py-2 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                className="px-3 text-cyan-500 hover:text-cyan-300 text-xs transition-colors"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
