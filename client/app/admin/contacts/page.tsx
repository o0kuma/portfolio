'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminAuthHeaders } from '@/lib/admin-token'

interface Contact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}

interface ReplyModal {
  contact: Contact
  body: string
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyModal, setReplyModal] = useState<ReplyModal | null>(null)
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState('')

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact', { headers: adminAuthHeaders() })
      const data = await res.json()
      if (data.success) setContacts(data.contacts)
      else setError(data.error || '불러오기 실패')
    } catch {
      setError('네트워크 오류')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyModal) return
    setReplying(true)
    setReplyError('')
    try {
      const res = await fetch(`/api/admin/contacts/${replyModal.contact.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
        body: JSON.stringify({ body: replyModal.body }),
      })
      const data = await res.json()
      if (data.success) {
        setReplyModal(null)
        fetchContacts()
      } else {
        setReplyError(data.error || '전송 실패')
      }
    } catch {
      setReplyError('네트워크 오류')
    } finally {
      setReplying(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-100 mb-6">연락처 관리</h1>
      {loading && <p className="text-neutral-500 font-mono text-sm">불러오는 중...</p>}
      {error && <p className="text-red-400 font-mono text-sm">{error}</p>}
      {!loading && !error && (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-neutral-100 text-sm">{c.name}</span>
                    <span className="text-neutral-500 text-xs font-mono">{c.email}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      c.status === 'unread'
                        ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
                        : c.status === 'replied'
                        ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                        : 'text-neutral-400 border-neutral-700'
                    }`}>{c.status}</span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-300 mb-1">{c.subject}</p>
                  <p className="text-xs text-neutral-500 line-clamp-2">{c.message}</p>
                  <p className="text-[10px] text-neutral-700 mt-1 font-mono">
                    {new Date(c.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyModal({ contact: c, body: '' })}
                  className="shrink-0 px-3 py-1.5 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg transition-colors"
                >
                  답장
                </button>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <p className="text-neutral-600 font-mono text-sm text-center py-12">연락처가 없습니다.</p>
          )}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <h2 className="font-semibold text-neutral-100">답장 보내기</h2>
              <button
                type="button"
                onClick={() => setReplyModal(null)}
                className="text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReply} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-500 mb-1">To</label>
                <div className="text-sm text-neutral-300 font-mono bg-neutral-800 px-3 py-2 rounded-lg">
                  {replyModal.contact.name} &lt;{replyModal.contact.email}&gt;
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-500 mb-1">Subject</label>
                <div className="text-sm text-neutral-300 font-mono bg-neutral-800 px-3 py-2 rounded-lg">
                  Re: {replyModal.contact.subject}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-500 mb-1">내용</label>
                <textarea
                  value={replyModal.body}
                  onChange={(e) => setReplyModal({ ...replyModal, body: e.target.value })}
                  rows={6}
                  className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-500 resize-none"
                  placeholder={`안녕하세요 ${replyModal.contact.name}님,\n\n`}
                  required
                />
              </div>
              {replyError && <p className="text-red-400 text-xs font-mono">{replyError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyModal(null)}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={replying}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {replying ? '전송 중...' : '답장 전송'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
