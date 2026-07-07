'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const sectionMessages: Record<string, string[]> = {
  home: [
    "Hi! Are you browsing the portfolio? 🤖",
    "Feel free to ask if you have any questions.",
    "I'm Kuuma. How can I help you?",
  ],
  about: [
    'Want to know more about the developer?',
    'Why not reach out directly?',
    "You're looking at the About section!",
  ],
  skills: [
    'React and Next.js are the main stack.',
    'Full-stack development experience here.',
    'A wide range of tech stacks are covered.',
  ],
  projects: [
    'These projects were all built from scratch.',
    'Click through if you want to see the demos!',
    'Which project looks most interesting to you?',
  ],
  posts: [
    'Running a tech blog here.',
    'What topic are you curious about?',
    'New posts get published often!',
  ],
  games: [
    'Games were built from scratch too!',
    'Tetris, Survive, and Tower Defense are here.',
    'Want to give one a try?',
  ],
  food: [
    'Restaurant list is managed in Notion.',
    'Need a restaurant recommendation?',
    'Only the good spots made the list!',
  ],
  contact: [
    'Looking for project collaboration?',
    "Email me and I'll get back to you!",
    'Feel free to reach out anytime!',
  ],
  admin: [
    'Welcome to the admin page.',
    'What would you like to manage?',
  ],
}

const chips = ['What projects are there?', 'How can I contact you?', 'What tech do you use?']

type Emotion = 'idle' | 'happy' | 'thinking' | 'surprised' | 'error'

export default function KuumaCompanion() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const targetPos = useRef({ x: -100, y: -100 })
  const currentPos = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number | undefined>(undefined)

  const [bubble, setBubble] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSection, setCurrentSection] = useState('home')
  const [emotion, setEmotion] = useState<Emotion>('idle')
  const [ttsEnabled, setTtsEnabled] = useState(false)

  const lastMoveRef = useRef(Date.now())
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const sectionTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function speak(text: string) {
    if (!ttsEnabled || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = 1.1
    utter.pitch = 1.1
    window.speechSynthesis.speak(utter)
  }

  const showBubble = useCallback((text: string) => {
    setBubble(text)
    setEmotion('surprised')
    if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
    emotionTimerRef.current = setTimeout(() => setEmotion('idle'), 2000)
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
      const bubbleText = randomMsg() + '  (Press J to chat)'
      showBubble(bubbleText)
      speak(bubbleText)
      sectionTimerRef.current = setInterval(
        () => {
          const msg = randomMsg()
          showBubble(msg)
          speak(msg)
        },
        45000 + Math.random() * 15000
      )
    }, 5000)

    return () => {
      clearTimeout(initialTimer)
      if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, showBubble])

  // Keyboard shortcut: J key toggles chat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'j' && e.key !== 'J') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
      setIsOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const emotionDotColor: Record<Emotion, string> = {
    idle: 'bg-cyan-400',
    happy: 'bg-amber-400',
    thinking: 'bg-violet-400',
    surprised: 'bg-orange-400',
    error: 'bg-red-400',
  }

  const emotionRingColor: Record<Emotion, string> = {
    idle: 'border-cyan-400/40',
    happy: 'border-amber-400/40',
    thinking: 'border-violet-400/40',
    surprised: 'border-orange-400/40',
    error: 'border-red-400/40',
  }

  const emotionClass: Record<Emotion, string> = {
    idle: 'kuuma-breathe',
    happy: 'kuuma-emotion-happy',
    thinking: 'kuuma-emotion-thinking',
    surprised: 'kuuma-emotion-surprised',
    error: 'kuuma-emotion-error',
  }

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = text || input
      if (!content.trim() || loading) return

      const userMsg = { role: 'user', content }
      setMessages((prev) => [...prev].slice(-4).concat(userMsg))
      setInput('')
      setEmotion('happy')
      setLoading(true)
      setEmotion('thinking')

      try {
        const res = await fetch('/api/kuuma/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: messages.slice(-8).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          }),
        })
        const data = await res.json()
        const reply = data.reply || "Sorry, I didn't get a response."
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
        speak(reply)
        if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
        emotionTimerRef.current = setTimeout(() => setEmotion('idle'), 1000)
      } catch {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection issue occurred. Please try again.' }])
        setEmotion('error')
        if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
        emotionTimerRef.current = setTimeout(() => setEmotion('idle'), 3000)
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, loading, messages, ttsEnabled]
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
        .kuuma-emotion-happy {
          animation: kuuma-breathe-happy 1s ease-in-out infinite;
        }
        .kuuma-emotion-thinking {
          animation: kuuma-breathe-thinking 2s ease-in-out infinite;
        }
        .kuuma-emotion-surprised {
          animation: kuuma-flash 0.5s ease-out;
        }
        .kuuma-emotion-error {
          animation: kuuma-breathe-error 0.8s ease-in-out infinite;
        }
        @keyframes kuuma-breathe-happy {
          0%,100% { box-shadow: 0 0 12px rgb(251 191 36), 0 0 30px rgb(251 191 36 / 0.6); }
          50% { box-shadow: 0 0 24px rgb(251 191 36), 0 0 50px rgb(251 191 36 / 0.9); }
        }
        @keyframes kuuma-breathe-thinking {
          0%,100% { box-shadow: 0 0 8px rgb(167 139 250), 0 0 20px rgb(167 139 250 / 0.5); }
          50% { box-shadow: 0 0 20px rgb(167 139 250), 0 0 40px rgb(167 139 250 / 0.8); }
        }
        @keyframes kuuma-flash {
          0% { box-shadow: 0 0 30px rgb(251 146 60), 0 0 60px rgb(251 146 60 / 0.8); }
          100% { box-shadow: 0 0 8px rgb(34 211 238), 0 0 20px rgb(34 211 238 / 0.5); }
        }
        @keyframes kuuma-breathe-error {
          0%,100% { box-shadow: 0 0 8px rgb(239 68 68), 0 0 20px rgb(239 68 68 / 0.5); }
          50% { box-shadow: 0 0 20px rgb(239 68 68), 0 0 40px rgb(239 68 68 / 0.8); }
        }
      `}</style>

      {/* Speech bubble — separate fixed element to avoid width constraints */}
      {bubble && !isOpen && (
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y - 52,
            zIndex: 9998,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <div
            className="bg-black/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-sm"
            style={{
              boxShadow: '0 0 10px rgb(34 211 238 / 0.2)',
              whiteSpace: 'nowrap',
              maxWidth: '260px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {bubble}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-cyan-500/50 rotate-45" />
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Character rings — purely visual, no pointer events */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full border ${emotionRingColor[emotion]} kuuma-spin`} />
          <div
            className="absolute inset-1.5 rounded-full border border-cyan-400/60 bg-cyan-950/80 backdrop-blur-sm"
            style={{ boxShadow: '0 0 12px rgb(34 211 238 / 0.5), inset 0 0 8px rgb(34 211 238 / 0.2)' }}
          />
          <div className={`w-3 h-3 rounded-full ${emotionDotColor[emotion]} kuuma-pulse-core relative z-10 ${emotionClass[emotion]}`} />
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute w-1 h-1 bg-cyan-400/80 rounded-full"
              style={{ transform: `rotate(${deg}deg) translateX(22px)` }}
            />
          ))}
        </div>
      </div>

      {/* Fixed chat toggle button — bottom-right, always accessible */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 10001,
          pointerEvents: 'auto',
          outline: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          width: '36px',
          height: '36px',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Open Kuuma chat"
      >
        <div
          className="w-8 h-8 rounded-full border border-cyan-500/60 bg-cyan-950/80 flex items-center justify-center"
          style={{ boxShadow: '0 0 10px rgb(34 211 238 / 0.4)' }}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 kuuma-pulse-core" />
        </div>
      </button>

      {/* Chat panel — fixed bottom-right, independent of cursor position */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 10000,
            pointerEvents: 'auto',
          }}
          className="w-72 bg-black/95 border border-cyan-500/30 rounded-sm font-mono"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20">
            <span className="text-cyan-400 text-xs tracking-widest">KUUMA</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTtsEnabled(o => !o)}
                className="text-cyan-600 hover:text-cyan-400 text-xs transition-colors"
                title="Toggle voice"
              >
                {ttsEnabled ? '🔊' : '🔇'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-cyan-600 hover:text-cyan-400 text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-48 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-cyan-700 text-xs text-center mt-10">Ask me anything</div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-xs ${m.role === 'user' ? 'text-right text-neutral-300' : 'text-left text-cyan-300'}`}
              >
                <span
                  className={`inline-block px-2 py-1 max-w-[220px] text-left ${
                    m.role === 'user'
                      ? 'bg-neutral-800'
                      : 'bg-cyan-950/50 border border-cyan-500/20'
                  } rounded-sm`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-cyan-500 text-xs animate-pulse">Thinking...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex border-t border-cyan-500/20">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ask Kuuma anything..."
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
    </>
  )
}
