'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type GuestbookEntry = {
  id: number
  name: string
  message: string
  emoji: string
  created_at: string
}

const EMOJIS = ['👋', '🎉', '😊', '🔥', '💻', '✨', '🚀', '❤️']

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}개월 전`
  return `${Math.floor(months / 12)}년 전`
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState('👋')

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/guestbook')
      const data = await res.json()
      if (data.entries) setEntries(data.entries)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, emoji }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
      } else {
        setSuccess(true)
        setName('')
        setMessage('')
        setEmoji('👋')
        fetchEntries()
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 text-sm font-mono mb-8 transition-colors"
          >
            ← 홈으로
          </Link>
          <p className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase mb-3">Guestbook</p>
          <h1 className="text-4xl font-black text-neutral-50 mb-2">방명록</h1>
          <p className="text-neutral-500 text-sm font-mono">방문해주셔서 감사합니다. 짧은 메시지를 남겨주세요.</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-12"
        >
          <h2 className="text-sm font-bold font-mono text-neutral-400 mb-5 tracking-[0.1em]">메시지 남기기</h2>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-neutral-500 mb-1.5">이름 (2~30자)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="홍길동"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
            />
          </div>

          {/* Emoji picker */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-neutral-500 mb-1.5">이모지 선택</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${
                    emoji === e
                      ? 'bg-neutral-600 ring-2 ring-neutral-400'
                      : 'bg-neutral-800 hover:bg-neutral-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="mb-5">
            <label className="block text-xs font-mono text-neutral-500 mb-1.5">
              메시지 (5~200자) — {message.length}/200
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="안녕하세요! 좋은 포트폴리오네요 :)"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono mb-4">{error}</p>
          )}
          {success && (
            <p className="text-emerald-400 text-xs font-mono mb-4">메시지가 등록되었습니다!</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-neutral-100 hover:bg-white text-neutral-950 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </form>

        {/* Entries */}
        <div>
          <h2 className="text-sm font-bold font-mono text-neutral-500 mb-6 tracking-[0.1em]">
            {loading ? '불러오는 중...' : `${entries.length}개의 메시지`}
          </h2>

          {!loading && entries.length === 0 && (
            <p className="text-neutral-600 text-sm font-mono text-center py-12">
              아직 메시지가 없습니다. 첫 번째 메시지를 남겨주세요!
            </p>
          )}

          <div className="grid gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{entry.emoji}</span>
                  <div>
                    <span className="text-neutral-200 font-semibold text-sm">{entry.name}</span>
                    <span className="text-neutral-600 text-xs font-mono ml-2">
                      {relativeTime(entry.created_at)}
                    </span>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed pl-11">{entry.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
