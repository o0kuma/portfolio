import { getApiBaseUrl } from '@/lib/api-base-url'

const API_BASE_URL = getApiBaseUrl()

export interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  aiFeatures?: {
    tone?: string
    emotion?: string
    intent?: string
    confidence?: number
    translation?: string
    suggestions?: string[]
  }
}

export interface AIResponse {
  success: boolean
  response?: string
  error?: string
  tone?: string
  emotion?: string
  intent?: string
  confidence?: number
  sessionId?: string
  responseTime?: number
}

export interface TextImprovementResponse {
  success: boolean
  originalText: string
  improvedText: string
  improvementType: string
  error?: string
}

export interface TranslationResponse {
  success: boolean
  originalText: string
  translatedText: string
  targetLanguage: string
  error?: string
}

export interface SummaryResponse {
  success: boolean
  originalText: string
  summary: string
  summaryLength: string
  error?: string
}

export interface SuggestionResponse {
  success: boolean
  originalMessage: string
  suggestions: string
  tone: string
  error?: string
}

// AI 채팅 API 호출
export const sendChatMessage = async (
  message: string,
  tone: string = '친근하게',
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        tone,
        conversationHistory: conversationHistory.map(msg => ({
          content: msg.content,
          isUser: msg.isUser
        }))
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('AI 채팅 오류:', error)
    return {
      success: false,
      error: 'AI 응답을 받는 중 오류가 발생했습니다.'
    }
  }
}

// 텍스트 개선 API 호출 (Next.js API 라우트)
export const improveText = async (
  text: string,
  improvementType: string = 'general'
): Promise<TextImprovementResponse> => {
  try {
    const response = await fetch(`/api/ai/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        improvementType
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('텍스트 개선 오류:', error)
    return {
      success: false,
      originalText: text,
      improvedText: text,
      improvementType,
      error: '텍스트 개선 중 오류가 발생했습니다.'
    }
  }
}

// 번역 API 호출
export const translateText = async (
  text: string,
  targetLanguage: string = 'English'
): Promise<TranslationResponse> => {
  try {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('번역 오류:', error)
    return {
      success: false,
      originalText: text,
      translatedText: text,
      targetLanguage,
      error: '번역 중 오류가 발생했습니다.'
    }
  }
}

// 요약 API 호출 (Next.js API 라우트)
export const summarizeText = async (
  text: string,
  summaryLength: string = 'medium'
): Promise<SummaryResponse> => {
  try {
    const response = await fetch(`/api/ai/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        summaryLength
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('요약 오류:', error)
    return {
      success: false,
      originalText: text,
      summary: text,
      summaryLength,
      error: '요약 중 오류가 발생했습니다.'
    }
  }
}

// 응답 제안 API 호출
export const suggestResponse = async (
  message: string,
  context: string = '',
  tone: string = '친근하게'
): Promise<SuggestionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/suggest-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context,
        tone
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('응답 제안 오류:', error)
    return {
      success: false,
      originalMessage: message,
      suggestions: '',
      tone,
      error: '응답 제안 중 오류가 발생했습니다.'
    }
  }
}

// 개선 타입 옵션
export const improvementTypes = [
  { value: 'general', label: '일반적인 개선' },
  { value: 'grammar', label: '문법 및 맞춤법' },
  { value: 'formal', label: '공식적인 톤' },
  { value: 'casual', label: '친근한 톤' },
  { value: 'concise', label: '간결하게' }
]

// 요약 길이 옵션
export const summaryLengths = [
  { value: 'short', label: '짧게 (1-2문장)' },
  { value: 'medium', label: '보통 (3-5문장)' },
  { value: 'long', label: '길게 (5-7문장)' }
]

// 번역 언어 옵션
export const targetLanguages = [
  { value: 'English', label: '영어' },
  { value: 'Japanese', label: '일본어' },
  { value: 'Chinese', label: '중국어' },
  { value: 'Spanish', label: '스페인어' },
  { value: 'French', label: '프랑스어' },
  { value: 'German', label: '독일어' },
  { value: 'Korean', label: '한국어' }
]
