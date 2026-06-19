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

const PRESETS = [
  { label: '코드 리뷰', labelEn: 'Code Review', prompt: 'Please review this code and suggest improvements:\n\n' },
  { label: '번역', labelEn: 'Translate', prompt: 'Translate the following to English:\n\n' },
  { label: '요약', labelEn: 'Summarize', prompt: 'Please summarize the following:\n\n' },
  { label: '설명', labelEn: 'Explain', prompt: 'Please explain this in simple terms:\n\n' },
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
  const [selectedTone, setSelectedTone] = useState('친근하게')
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

  // 세션 ID 생성 및 대화 히스토리 로드
  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
      loadConversationHistory(newSessionId)
      checkSubscription(newSessionId)
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
      console.error('구독 상태 확인 오류:', error)
    }
  }

  // 대화 히스토리 로드
  const loadConversationHistory = async (sessionId: string) => {
    try {
      setIsLoadingHistory(true)

      // Try localStorage first
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
            setIsLoadingHistory(false)
            return
          }
        } catch {}
      }

      const response = await fetch(`/api/ai/conversation/${sessionId}`)
      const data = await response.json()

      if (data.success && data.messages) {
        setMessages(data.messages)
      } else {
        // 기본 환영 메시지
        setMessages([{
          id: 'welcome',
          content: '안녕하세요! 저는 AI 어시스턴트입니다. 메시지 작성, 번역, 톤 조절 등 다양한 기능을 도와드릴 수 있어요. 무엇을 도와드릴까요?',
          isUser: false,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('대화 히스토리 로드 오류:', error)
      // 기본 환영 메시지
      setMessages([{
        id: 'welcome',
        content: '안녕하세요! 저는 AI 어시스턴트입니다. 메시지 작성, 번역, 톤 조절 등 다양한 기능을 도와드릴 수 있어요. 무엇을 도와드릴까요?',
        isUser: false,
        timestamp: new Date()
      }])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const tones = [
    { value: '친근하게', label: '친근하게', icon: '😊' },
    { value: '공식적으로', label: '공식적으로', icon: '👔' },
    { value: '간단하게', label: '간단하게', icon: '⚡' },
    { value: '전문적으로', label: '전문적으로', icon: '🎓' }
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
            content: `일일 무료 메시지 한도(${errorData.limit}개)를 모두 사용하셨습니다. 프리미엄 구독으로 업그레이드하여 무제한으로 사용하세요!`,
            isUser: false,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, limitMessage])
          setShowUsageLimit(true)
        } else {
          const fallbackResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: '죄송합니다. 현재 AI 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
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
      console.error('AI 응답 오류:', error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'AI 응답을 받는 중 오류가 발생했습니다. 다시 시도해주세요.',
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
      '친근하게': [
        `안녕하세요! "${input}"에 대해 말씀해주셨네요. 더 자세히 알려드릴게요! 😊`,
        `좋은 질문이에요! "${input}"에 대해서는 이렇게 생각해봐요...`,
        `와, 정말 흥미로운 주제네요! "${input}"에 대해 함께 알아봐요!`
      ],
      '공식적으로': [
        `안녕하십니까. "${input}"에 대한 문의를 주셔서 감사합니다. 관련하여 다음과 같이 안내드립니다.`,
        `귀하께서 문의하신 "${input}"에 대해 공식적으로 답변드리겠습니다.`,
        `말씀하신 "${input}"에 관하여 정확한 정보를 제공해드리겠습니다.`
      ],
      '간단하게': [
        `"${input}"에 대해 간단히 설명드릴게요.`,
        `"${input}" - 핵심만 말씀드리면...`,
        `"${input}"에 대한 답변:`
      ],
      '전문적으로': [
                `"${input}"에 대한 전문적 분석을 제공해드리겠습니다.`,
        `해당 주제 "${input}"에 대해 기술적 관점에서 설명드리겠습니다.`,
        `"${input}"에 대한 상세한 전문 정보를 공유해드리겠습니다.`
      ]
    }
    
    const toneResponses = responses[tone as keyof typeof responses] || responses['친근하게']
    return toneResponses[Math.floor(Math.random() * toneResponses.length)]
  }

  const generateSuggestions = (input: string): string[] => {
    return [
      '이 내용을 더 자세히 설명해주세요',
      '다른 관점에서도 알려주세요',
      '관련 예시를 들어주세요'
    ]
  }

  const handleMicClick = useCallback(() => {
    const SpeechRecognitionCtor =
      (typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null

    if (!SpeechRecognitionCtor) {
      toast.warning('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.')
      return
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputText(prev => prev ? prev + ' ' + transcript : transcript)
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error('음성 인식 오류:', event.error)
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
      toast.warning('처리할 텍스트가 없습니다.')
      return
    }

    try {
      switch (feature) {
        case 'translate':
          const translationResponse = await translateText(textToProcess, 'English')
          if (translationResponse.success) {
            const translationMessage: ChatMessage = {
              id: Date.now().toString(),
              content: `번역 결과:\n\n원문: ${translationResponse.originalText}\n\n번역: ${translationResponse.translatedText}`,
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
              content: `요약 결과:\n\n${summaryResponse.summary}`,
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
              content: `개선된 텍스트:\n\n${improvementResponse.improvedText}`,
              isUser: false,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, improvementMessage])
          }
          break
      }
    } catch (error) {
      console.error(`${feature} 기능 오류:`, error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `${feature} 기능 처리 중 오류가 발생했습니다.`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
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
          isMinimized ? 'w-80 h-16' : 'w-[95vw] sm:w-[420px] md:w-[480px] h-[80vh] max-h-[90vh]'
        } bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FiZap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                AI 어시스턴트
                {subscription?.isPremium && (
                  <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                    PRO
                  </span>
                )}
              </h3>
              <p className="text-xs text-white/80">
                {subscription ? (
                  subscription.isPremium ? (
                    '프리미엄 - 무제한'
                  ) : (
                    `일일 ${subscription.usage?.chat || 0}/${subscription.limits?.dailyChatMessages || 10}`
                  )
                ) : (
                  '온라인'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!subscription?.isPremium && stripeReady && (
              <button
                onClick={() => window.open('/subscription', '_blank')}
                className="px-2 py-1 text-xs bg-yellow-500 text-yellow-900 rounded font-semibold hover:bg-yellow-400 transition-colors"
                title="프리미엄으로 업그레이드"
              >
                업그레이드
              </button>
            )}
            <button
              onClick={() => { setMessages([]); localStorage.removeItem(STORAGE_KEY) }}
              className="p-1 hover:bg-white/20 rounded text-xs"
              title="대화 지우기"
            >
              대화 지우기
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded"
            >
              {isMinimized ? <FiMaximize2 className="w-4 h-4" /> : <FiMinimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* 톤 선택 및 사용량 표시 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">톤:</span>
                <div className="flex space-x-1">
                  {tones.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setSelectedTone(tone.value)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        selectedTone === tone.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                      }`}
                    >
                      {tone.icon} {tone.label}
                    </button>
                  ))}
                </div>
              </div>
              {!subscription?.isPremium && subscription && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">일일 사용량:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 dark:text-slate-400">
                      채팅: {subscription.usage?.chat || 0}/{subscription.limits?.dailyChatMessages || 10}
                    </span>
                    {stripeReady &&
                      (subscription.usage?.chat || 0) >=
                        (subscription.limits?.dailyChatMessages || 10) * 0.8 && (
                      <button
                        onClick={() => window.open('/subscription', '_blank')}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        업그레이드 →
                      </button>
                    )}
                  </div>
                </div>
              )}
              {/* Quota progress bar */}
              {quotaLimit > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>쿼터 사용</span>
                    <span>{quotaUsed}/{quotaLimit}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${quotaColor}`}
                      style={{ width: `${quotaPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className="text-xs opacity-70">
                        {formatTime(message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp))}
                      </p>
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        title="복사"
                        className="p-1 opacity-50 hover:opacity-100 transition-opacity rounded"
                      >
                        {copiedId === message.id
                          ? <FiCheck className="w-3 h-3" />
                          : <FiCopy className="w-3 h-3" />
                        }
                      </button>
                    </div>

                    {/* AI 기능 버튼들 */}
                    {!message.isUser && message.aiFeatures && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <button
                          onClick={() => handleAIFeature('translate', message.content)}
                          className="px-2 py-1 text-xs bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        >
                          <FiGlobe className="w-3 h-3 inline mr-1" />
                          번역
                        </button>
                        <button
                          onClick={() => handleAIFeature('summarize', message.content)}
                          className="px-2 py-1 text-xs bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        >
                          <FiEdit3 className="w-3 h-3 inline mr-1" />
                          요약
                        </button>
                        <button
                          onClick={() => handleAIFeature('improve', message.content)}
                          className="px-2 py-1 text-xs bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        >
                          <FiEdit3 className="w-3 h-3 inline mr-1" />
                          개선
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
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-600 flex-shrink-0">
              {/* Quick prompt presets */}
              <div className="flex flex-wrap gap-1 mb-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.labelEn}
                    onClick={() => { setInputText(preset.prompt); inputRef.current?.focus() }}
                    className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                    className="w-full p-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleMicClick}
                    title={isRecording ? '음성 인식 중지' : '음성으로 입력'}
                    className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {isRecording ? <FiMicOff className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
              
              {/* AI 기능 토글 및 버튼들 */}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAIFeatures(!showAIFeatures)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    showAIFeatures
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500'
                  }`}
                >
                  <FiZap className="w-3 h-3 inline mr-1" />
                  AI 기능
                </button>
                {showAIFeatures && (
                  <>
                    <button
                      onClick={() => handleAIFeature('summarize')}
                      className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                    >
                      <FiEdit3 className="w-3 h-3 inline mr-1" />
                      요약
                    </button>
                    <button
                      onClick={() => handleAIFeature('improve')}
                      className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                    >
                      <FiEdit3 className="w-3 h-3 inline mr-1" />
                      텍스트 개선
                    </button>
                    <button
                      onClick={() => handleAIFeature('translate')}
                      className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                    >
                      <FiGlobe className="w-3 h-3 inline mr-1" />
                      번역
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
