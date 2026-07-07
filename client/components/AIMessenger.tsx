'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSend,
  FiMic,
  FiMicOff,
  FiSettings,
  FiMessageSquare,
  FiZap,
  FiGlobe,
  FiEdit3,
  FiCheck,
  FiX,
  FiMinimize2,
  FiMaximize2,
  FiLoader,
  FiCopy
} from 'react-icons/fi'
import { 
  sendChatMessage, 
  improveText, 
  translateText, 
  summarizeText,
  suggestResponse,
  improvementTypes,
  summaryLengths,
  targetLanguages,
  type ChatMessage,
  type AIResponse,
  type TextImprovementResponse,
  type TranslationResponse,
  type SummaryResponse,
  type SuggestionResponse
} from '../utils/aiService'
import { toast } from '@/lib/toast'
import { isStripeConfigured } from '@/lib/stripe-config'

// Message 인터페이스는 aiService에서 가져온 ChatMessage와 동일하므로 제거

const STORAGE_KEY = 'ai_chat_history'
const SESSION_STORAGE_KEY = 'ai_chat_session_id'

function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const PRESETS = [
  { label: 'Code Review', labelEn: 'Code Review', prompt: 'Please review this code and suggest improvements:\n\n' },
  { label: 'Translate', labelEn: 'Translate', prompt: 'Translate the following to English:\n\n' },
  { label: 'Summarize', labelEn: 'Summarize', prompt: 'Please summarize the following:\n\n' },
  { label: 'Explain', labelEn: 'Explain', prompt: 'Please explain this in simple terms:\n\n' },
]

interface AIMessengerProps {
  isOpen: boolean
  onClose: () => void
  context?: 'portfolio' | 'blog' // 포트폴리오 또는 블로그 구분
}

export default function AIMessenger({ isOpen, onClose, context = 'portfolio' }: AIMessengerProps) {
  const stripeReady = isStripeConfigured()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedTone, setSelectedTone] = useState('Friendly')
  const [isRecording, setIsRecording] = useState(false)
  const [showAIFeatures, setShowAIFeatures] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [showUsageLimit, setShowUsageLimit] = useState(false)
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [quotaLimit, setQuotaLimit] = useState(10)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)))
    }
  }, [messages])

  // 세션 ID 복원/생성 및 대화 히스토리 로드
  useEffect(() => {
    if (isOpen && !sessionId) {
      let persistedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!persistedSessionId) {
        persistedSessionId = createSessionId()
        localStorage.setItem(SESSION_STORAGE_KEY, persistedSessionId)
      }
      setSessionId(persistedSessionId)
      loadConversationHistory(persistedSessionId)
      checkSubscription(persistedSessionId)
    }
  }, [isOpen, sessionId])

  // 구독 상태 확인
  const checkSubscription = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/subscription/check?sessionId=${sessionId}`)
      const data = await response.json()
      if (data.success) {
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error)
    }
  }

  // 대화 히스토리 로드
  const loadConversationHistory = async (sessionId: string) => {
    try {
      setIsLoadingHistory(true)

      const response = await fetch(`/api/ai/conversation/${sessionId}`)
      const data = await response.json()

      if (data.success && data.messages && data.messages.length > 0) {
        setMessages(data.messages)
        return
      }

      // DB에 기록이 없을 때만 localStorage 캐시 사용
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
            return
          }
        } catch {}
      }

      setMessages([{
        id: 'welcome',
        content: "Hi! I'm your AI assistant. I can help with writing messages, translation, tone adjustment, and more. How can I help you?",
        isUser: false,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      setMessages([{
        id: 'welcome',
        content: "Hi! I'm your AI assistant. I can help with writing messages, translation, tone adjustment, and more. How can I help you?",
        isUser: false,
        timestamp: new Date()
      }])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const tones = [
    { value: 'Friendly', label: 'Friendly', icon: '😊' },
    { value: 'Formal', label: 'Formal', icon: '👔' },
    { value: 'Concise', label: 'Concise', icon: '⚡' },
    { value: 'Professional', label: 'Professional', icon: '🎓' }
  ]

  const handleSendMessage = async () => {
    if (!inputText.trim() || !sessionId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsTyping(true)

    try {
      // 데이터베이스 연동 AI API 호출 (Next.js API Route 사용)
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          tone: selectedTone,
          sessionId: sessionId,
          userId: 'anonymous',
          context: context // 포트폴리오/블로그 구분 전달
        }),
      })

      // Parse quota headers
      const quotaUsedHeader = response.headers.get('X-Quota-Used')
      const quotaLimitHeader = response.headers.get('X-Quota-Limit')
      if (quotaUsedHeader !== null) setQuotaUsed(parseInt(quotaUsedHeader, 10))
      if (quotaLimitHeader !== null) setQuotaLimit(parseInt(quotaLimitHeader, 10))

      if (!response.ok) {
        // Handle error - parse as JSON
        const errorData = await response.json()
        if (errorData.errorCode === 'DAILY_LIMIT_EXCEEDED') {
          const limitMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `You've used up your daily free message limit (${errorData.limit}). Upgrade to Premium for unlimited access!`,
            isUser: false,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, limitMessage])
          setShowUsageLimit(true)
        } else {
          const fallbackResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: 'Sorry, the AI service is currently experiencing issues. Please try again shortly.',
            isUser: false,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, fallbackResponse])
        }
      } else {
        // Read the streaming response
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        const aiMsgId = (Date.now() + 1).toString()
        const aiResponse: ChatMessage = {
          id: aiMsgId,
          content: '',
          isUser: false,
          timestamp: new Date(),
          aiFeatures: {
            suggestions: generateSuggestions(currentInput)
          }
        }
        setMessages(prev => [...prev, aiResponse])
        setIsTyping(false)

        let done = false
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            setMessages(prev =>
              prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + chunk } : m)
            )
          }
        }

        // 구독 상태 업데이트
        await checkSubscription(sessionId)
      }
    } catch (error) {
      console.error('AI response error:', error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'An error occurred while getting the AI response. Please try again.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const generateAIResponse = (input: string, tone: string): string => {
    const responses = {
      'Friendly': [
        `Hi! You mentioned "${input}". Let me tell you more about it! 😊`,
        `Great question! Here's what I think about "${input}"...`,
        `Wow, that's a really interesting topic! Let's explore "${input}" together!`
      ],
      'Formal': [
        `Hello. Thank you for your inquiry regarding "${input}". Please find the following information.`,
        `We will formally respond to your inquiry regarding "${input}".`,
        `We will provide accurate information regarding "${input}".`
      ],
      'Concise': [
        `Here's a brief explanation of "${input}".`,
        `"${input}" - in short...`,
        `Answer regarding "${input}":`
      ],
      'Professional': [
        `Here is a professional analysis of "${input}".`,
        `Let me explain "${input}" from a technical perspective.`,
        `Here is detailed professional information regarding "${input}".`
      ]
    }
    
    const toneResponses = responses[tone as keyof typeof responses] || responses['Friendly']
    return toneResponses[Math.floor(Math.random() * toneResponses.length)]
  }

  const generateSuggestions = (input: string): string[] => {
    return [
      'Please explain this in more detail',
      'Tell me from a different perspective',
      'Give me a related example'
    ]
  }

  const handleMicClick = useCallback(() => {
    const SpeechRecognitionCtor =
      (typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null

    if (!SpeechRecognitionCtor) {
      toast.warning('This browser does not support voice recognition. Please use Chrome or Edge.')
      return
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputText(prev => prev ? prev + ' ' + transcript : transcript)
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error('Voice recognition error:', event.error)
      }
      setIsRecording(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null
    }

    recognition.start()
    setIsRecording(true)
  }, [isRecording])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAIFeature = async (feature: string, messageContent?: string) => {
    const textToProcess = messageContent || inputText
    
    if (!textToProcess.trim()) {
      toast.warning('There is no text to process.')
      return
    }

    try {
      switch (feature) {
        case 'translate':
          const translationResponse = await translateText(textToProcess, 'English')
          if (translationResponse.success) {
            const translationMessage: ChatMessage = {
              id: Date.now().toString(),
              content: `Translation result:\n\nOriginal: ${translationResponse.originalText}\n\nTranslated: ${translationResponse.translatedText}`,
              isUser: false,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, translationMessage])
          }
          break
          
        case 'summarize':
          const summaryResponse = await summarizeText(textToProcess, 'medium')
          if (summaryResponse.success) {
            const summaryMessage: ChatMessage = {
              id: Date.now().toString(),
              content: `Summary result:\n\n${summaryResponse.summary}`,
              isUser: false,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, summaryMessage])
          }
          break
          
        case 'improve':
          const improvementResponse = await improveText(textToProcess, 'general')
          if (improvementResponse.success) {
            const improvementMessage: ChatMessage = {
              id: Date.now().toString(),
              content: `Improved text:\n\n${improvementResponse.improvedText}`,
              isUser: false,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, improvementMessage])
          }
          break
      }
    } catch (error) {
      console.error(`${feature} feature error:`, error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `An error occurred while processing the ${feature} feature.`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 2000)
    } catch {
      // clipboard not available
    }
  }

  const quotaPct = quotaLimit > 0 ? Math.min(100, (quotaUsed / quotaLimit) * 100) : 0
  const quotaColor =
    quotaPct >= 90 ? 'bg-red-500' : quotaPct >= 70 ? 'bg-yellow-500' : 'bg-green-500'

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={`fixed bottom-4 right-4 z-50 ${
          isMinimized ? 'w-80 h-14' : 'w-[95vw] sm:w-[420px] md:w-[460px] h-[80vh] max-h-[90vh]'
        } bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <FiZap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-neutral-100 font-mono">AI Assistant</span>
              {subscription?.isPremium && (
                <span className="ml-2 text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">PRO</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!subscription?.isPremium && stripeReady && (
              <button
                onClick={() => window.open('/subscription', '_blank')}
                className="px-2 py-1 text-[10px] font-mono border border-neutral-700 text-neutral-400 rounded hover:border-neutral-500 hover:text-neutral-200 transition-colors"
              >
                Upgrade
              </button>
            )}
            <button
              onClick={() => {
                const newSessionId = createSessionId()
                setMessages([])
                setSessionId(newSessionId)
                localStorage.removeItem(STORAGE_KEY)
                localStorage.setItem(SESSION_STORAGE_KEY, newSessionId)
              }}
              className="p-1.5 text-neutral-600 hover:text-neutral-400 transition-colors rounded"
              title="Clear conversation"
            >
              <FiX className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-neutral-600 hover:text-neutral-400 transition-colors rounded"
            >
              {isMinimized ? <FiMaximize2 className="w-3.5 h-3.5" /> : <FiMinimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-600 hover:text-neutral-300 transition-colors rounded"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Tone selection and usage */}
            <div className="px-4 py-2.5 border-b border-neutral-800/60 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Tone</span>
                <div className="flex gap-1">
                  {tones.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setSelectedTone(tone.value)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                        selectedTone === tone.value
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                          : 'border-neutral-800 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400'
                      }`}
                    >
                      {tone.icon} {tone.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Quota bar */}
              {quotaLimit > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-700">
                    <span>Quota</span>
                    <span>{quotaUsed} / {quotaLimit}</span>
                  </div>
                  <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${quotaColor}`}
                      style={{ width: `${quotaPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                      message.isUser
                        ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                        : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-1.5 gap-2">
                      <span className="text-[10px] font-mono text-neutral-700">
                        {formatTime(message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp))}
                      </span>
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        title="Copy"
                        className="text-neutral-700 hover:text-neutral-400 transition-colors"
                      >
                        {copiedId === message.id
                          ? <FiCheck className="w-3 h-3 text-cyan-500" />
                          : <FiCopy className="w-3 h-3" />
                        }
                      </button>
                    </div>
                    {/* AI feature buttons */}
                    {!message.isUser && message.aiFeatures && (
                      <div className="mt-2 flex flex-wrap gap-1 pt-1.5 border-t border-neutral-800">
                        <button
                          onClick={() => handleAIFeature('translate', message.content)}
                          className="px-2 py-0.5 text-[10px] font-mono border border-neutral-800 text-neutral-600 rounded hover:border-neutral-700 hover:text-neutral-400 transition-colors"
                        >
                          <FiGlobe className="w-3 h-3 inline mr-1" />Translate
                        </button>
                        <button
                          onClick={() => handleAIFeature('summarize', message.content)}
                          className="px-2 py-0.5 text-[10px] font-mono border border-neutral-800 text-neutral-600 rounded hover:border-neutral-700 hover:text-neutral-400 transition-colors"
                        >
                          <FiEdit3 className="w-3 h-3 inline mr-1" />Summarize
                        </button>
                        <button
                          onClick={() => handleAIFeature('improve', message.content)}
                          className="px-2 py-0.5 text-[10px] font-mono border border-neutral-800 text-neutral-600 rounded hover:border-neutral-700 hover:text-neutral-400 transition-colors"
                        >
                          <FiEdit3 className="w-3 h-3 inline mr-1" />Improve
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-neutral-900 border border-neutral-800 px-3 py-2.5 rounded-xl">
                    <div className="flex space-x-1 items-center">
                      <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-neutral-800 flex-shrink-0">
              {/* Quick prompt presets */}
              <div className="flex flex-wrap gap-1 mb-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.labelEn}
                    onClick={() => { setInputText(preset.prompt); inputRef.current?.focus() }}
                    className="px-2 py-0.5 text-[10px] font-mono border border-neutral-800 text-neutral-600 rounded hover:border-neutral-700 hover:text-neutral-400 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message... (Shift+Enter for new line)"
                    className="w-full px-3 py-2.5 pr-10 border border-neutral-800 rounded-xl resize-none focus:outline-none focus:border-neutral-600 bg-neutral-900 text-neutral-200 placeholder-neutral-700 text-sm font-mono"
                    rows={1}
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleMicClick}
                    title={isRecording ? 'Stop voice recognition' : 'Input by voice'}
                    className={`absolute right-2 bottom-2 p-1.5 rounded transition-colors ${
                      isRecording
                        ? 'text-red-500 animate-pulse'
                        : 'text-neutral-700 hover:text-neutral-400'
                    }`}
                  >
                    {isRecording ? <FiMicOff className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-xl hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>

              {/* AI feature toggle and buttons */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setShowAIFeatures(!showAIFeatures)}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                    showAIFeatures
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                      : 'border-neutral-800 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400'
                  }`}
                >
                  <FiZap className="w-3 h-3 inline mr-1" />AI Features
                </button>
                {showAIFeatures && (
                  <>
                    <button
                      onClick={() => handleAIFeature('summarize')}
                      className="px-2.5 py-1 text-[10px] font-mono border border-neutral-800 text-neutral-600 rounded hover:border-neutral-700 hover:text-neutral-400 transition-colors"
                    >
                      <FiEdit3 className="w-3 h-3 inline mr-1" />Summarize
                    </button>
                    <button
                      onClick={() => handleAIFeature('improve')}
                      className="px-2.5 py-1 text-[10px] font-mono border border-neutral-800 text-neutral-600 rounded hover:border-neutral-700 hover:text-neutral-400 transition-colors"
                    >
                      <FiEdit3 className="w-3 h-3 inline mr-1" />Improve
                    </button>
                    <button
                      onClick={() => handleAIFeature('translate')}
                      className="px-2.5 py-1 text-[10px] font-mono border border-neutral-800 text-neutral-600 rounded hover:border-neutral-700 hover:text-neutral-400 transition-colors"
                    >
                      <FiGlobe className="w-3 h-3 inline mr-1" />Translate
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
