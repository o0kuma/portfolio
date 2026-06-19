'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Comment {
  id: number
  post_id: string
  parent_id: number | null
  author_name: string
  content: string
  created_at: string
}

interface Props {
  postId: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function CommentForm({
  postId,
  parentId,
  onSubmitted,
  onCancel,
}: {
  postId: string
  parentId?: number | null
  onSubmitted: () => void
  onCancel?: () => void
}) {
  const { locale } = useLanguage()
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    setLoading(true)
    try {
      await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: name,
          content,
          parent_id: parentId ?? null,
        }),
      })
      setName('')
      setContent('')
      onSubmitted()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={locale === 'ko' ? '이름' : 'Name'}
        maxLength={100}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={locale === 'ko' ? '댓글을 입력하세요...' : 'Write a comment...'}
        maxLength={2000}
        rows={3}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 resize-none"
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '...' : locale === 'ko' ? '댓글 작성' : 'Post Comment'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-neutral-500 text-xs px-3 py-2 hover:text-neutral-300"
          >
            {locale === 'ko' ? '취소' : 'Cancel'}
          </button>
        )}
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  allComments,
  postId,
  onRefresh,
}: {
  comment: Comment
  allComments: Comment[]
  postId: string
  onRefresh: () => void
}) {
  const { locale } = useLanguage()
  const [replying, setReplying] = useState(false)
  const replies = allComments.filter((c) => c.parent_id === comment.id)

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs text-neutral-400 font-mono shrink-0">
          {comment.author_name[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-neutral-200">
              {comment.author_name}
            </span>
            <span className="text-xs text-neutral-600 font-mono">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
          <button
            onClick={() => setReplying((r) => !r)}
            className="mt-1 text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            {locale === 'ko' ? '답글' : 'Reply'}
          </button>
          {replying && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSubmitted={() => {
                  setReplying(false)
                  onRefresh()
                }}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-11 border-l border-neutral-800 pl-4 space-y-3">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              allComments={allComments}
              postId={postId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommentSection({ postId }: Props) {
  const { locale } = useLanguage()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      const data = (await res.json()) as Comment[]
      setComments(Array.isArray(data) ? data : [])
    } catch {
      // ignore fetch errors
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const topLevel = comments.filter((c) => !c.parent_id)

  return (
    <section className="mt-12 pt-8 border-t border-neutral-800">
      <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-[0.2em] mb-6">
        {locale === 'ko'
          ? `댓글 ${comments.length}개`
          : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
      </h2>

      <div className="mb-8">
        <CommentForm postId={postId} onSubmitted={fetchComments} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 bg-neutral-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-neutral-700 text-sm font-mono text-center py-8">
          {locale === 'ko' ? '첫 댓글을 작성해보세요.' : 'Be the first to comment.'}
        </p>
      ) : (
        <div className="space-y-6">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              allComments={comments}
              postId={postId}
              onRefresh={fetchComments}
            />
          ))}
        </div>
      )}
    </section>
  )
}
