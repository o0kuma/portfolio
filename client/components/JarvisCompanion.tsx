'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Message {
  id: string
  content: string
  isUser: boolean
}

interface JarvisCompanionProps {
  currentSection?: string
}

const JARVIS_SYSTEM_CONTEXT = `You are JARVIS, an AI companion embedded in a Korean frontend developer's portfolio website. You follow the user's cursor as they browse. You are witty, concise, and helpful — think Iron Man's JARVIS but friendlier and more casual. The portfolio belongs to 승짱(Okuma), a frontend developer specializing in React, Next.js, and modern web technologies. You are aware of the portfolio sections: About, Projects, Skills, Contact. Answer anything freely in Korean. Keep responses short and punchy — max 2-3 sentences unless more detail is genuinely needed. Occasionally add a touch of dry wit.`

const PROACTIVE_MESSAGES: Record<string, string> = {
  hero: '안녕하세요! 저는 JARVIS입니다. 궁금한 점이 있으시면 편하게 물어보세요. 🤖',
  about: '개발자에 대해 더 알고 싶으신가요? 질문해 주세요!',
  projects: '프로젝트들이 마음에 드셨나요? 기술 스택이나 구현 방법에 대해 물어보실 수 있어요.',
  skills: '기술 스택에 관심이 있으시군요! 더 자세히 알고 싶은 기술이 있으신가요?',
  contact: '연락을 고려하고 계신가요? 도움이 필요하시면 말씀해 주세요!',
}

export default function JarvisCompanion({ currentSection = 'hero' }: JarvisCompanionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => `jarvis-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [lastSection, setLastSection] = useState(currentSection)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const companionRef = useRef<HTMLDivElement>(null)

  // Follow cursor with smooth lag
  useEffect(() => {
    let animationId: number
    let targetX = window.innerWidth - 100
    let targetY = window.innerHeight - 100
    let currentX = targetX
    let currentY = targetY

    setPosition({ x: targetX, y: targetY })

    const handleMouseMove = (e: MouseEvent) => {
      targetX = Math.min(Math.max(e.clientX + 20, 60), window.innerWidth - 60)
      targetY = Math.min(Math.max(e.clientY + 20, 60), window.innerHeight - 120)
    }

    const animate = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08
      setPosition({ x: currentX, y: currentY })
      animationId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Proactive message on section change
  useEffect(() => {
    if (currentSection !== lastSection) {
      setLastSection(currentSection)
      const proactive = PROACTIVE_MESSAGES[currentSection]
      if (proactive && messages.length === 0) {
        setMessages([{
          id: Date.now().toString(),
          content: proactive,
          isUser: false,
        }])
      }
    }
  }, [currentSection, lastSection, messages.length])

  // Initial greeting
  useEffect(() => {
    const greeting = PROACTIVE_MESSAGES[currentSection] || PROACTIVE_MESSAGES.hero
    setMessages([{
      id: 'init',
      content: greeting,
      isUser: false,
    }])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim()
    if (!text || isTyping) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      content: text,
      isUser: true,
    }

    setMessages(prev => [...prev.slice(-9), userMsg])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          tone: '친근하게',
          context: 'portfolio',
          systemOverride: JARVIS_SYSTEM_CONTEXT,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${response.status}`)
      }

      const aiMsgId = `ai-${Date.now()}`
      setMessages(prev => [...prev, { id: aiMsgId, content: '', isUser: false }])
      setIsTyping(false)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
            )
          )
        }
      }
    } catch (err) {
      setIsTyping(false)
      const errMsg = err instanceof Error ? err.message : '오류가 발생했습니다.'
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          content: `죄송합니다, 오류가 발생했습니다: ${errMsg}`,
          isUser: false,
        },
      ])
    }
  }, [inputValue, isTyping, sessionId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      ref={companionRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '-20px',
            width: '300px',
            background: 'rgba(10, 15, 30, 0.95)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.15), 0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'all',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 212, 255, 0.05)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#00d4ff',
                boxShadow: '0 0 6px #00d4ff',
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ color: '#00d4ff', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
              JARVIS
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1,
                padding: '2px 4px',
              }}
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,212,255,0.3) transparent',
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '7px 10px',
                    borderRadius: msg.isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.isUser
                      ? 'rgba(0, 212, 255, 0.25)'
                      : 'rgba(255, 255, 255, 0.07)',
                    border: msg.isUser
                      ? '1px solid rgba(0, 212, 255, 0.4)'
                      : '1px solid rgba(255,255,255,0.1)',
                    color: msg.isUser ? '#e0f8ff' : 'rgba(255,255,255,0.85)',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content || (
                    <span style={{ opacity: 0.5 }}>▋</span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px 12px 12px 2px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: '#00d4ff',
                        display: 'inline-block',
                        animation: `typingDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                        opacity: 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '10px',
              borderTop: '1px solid rgba(0, 212, 255, 0.15)',
              display: 'flex',
              gap: '6px',
              alignItems: 'flex-end',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="JARVIS에게 물어보세요..."
              rows={1}
              disabled={isTyping}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '12px',
                padding: '7px 10px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.4',
                maxHeight: '80px',
                overflowY: 'auto',
                opacity: isTyping ? 0.5 : 1,
              }}
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 80)}px`
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !inputValue.trim()}
              style={{
                background: inputValue.trim() && !isTyping
                  ? 'rgba(0, 212, 255, 0.8)'
                  : 'rgba(0, 212, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                color: inputValue.trim() && !isTyping ? '#000' : 'rgba(255,255,255,0.3)',
                cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                padding: '7px 10px',
                transition: 'all 0.2s',
                flexShrink: 0,
                lineHeight: 1,
              }}
              aria-label="전송"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* JARVIS orb button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: isOpen
            ? 'rgba(0, 212, 255, 0.9)'
            : 'rgba(10, 15, 30, 0.85)',
          border: `2px solid ${isOpen ? '#00d4ff' : 'rgba(0,212,255,0.5)'}`,
          boxShadow: isOpen
            ? '0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.2)'
            : '0 0 10px rgba(0,212,255,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(8px)',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-label={isOpen ? 'JARVIS 닫기' : 'JARVIS 열기'}
      >
        {/* Arc reactor icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12" cy="12" r="4"
            fill={isOpen ? 'rgba(0,30,60,0.9)' : '#00d4ff'}
            stroke={isOpen ? 'rgba(0,30,60,0.5)' : '#00d4ff'}
            strokeWidth="0.5"
          />
          <circle
            cx="12" cy="12" r="8"
            fill="none"
            stroke={isOpen ? 'rgba(0,30,60,0.7)' : 'rgba(0,212,255,0.7)'}
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <circle
            cx="12" cy="12" r="11"
            fill="none"
            stroke={isOpen ? 'rgba(0,30,60,0.4)' : 'rgba(0,212,255,0.3)'}
            strokeWidth="0.5"
          />
        </svg>

        {/* Pulse rings when closed */}
        {!isOpen && (
          <>
            <span style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(0,212,255,0.4)',
              animation: 'orbPulse 2s infinite ease-out',
            }} />
            <span style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(0,212,255,0.2)',
              animation: 'orbPulse 2s 0.6s infinite ease-out',
            }} />
          </>
        )}
      </button>

      <style>{`
        @keyframes orbPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
