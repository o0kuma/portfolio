'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useLanguage } from '@/lib/LanguageContext'
import { getApiBaseUrl } from '@/lib/api-base-url'

const API_BASE_URL = getApiBaseUrl()

interface Post {
  _id: string
  id: string
  title: string
  createdAt: string
  created_at?: string
  tags?: string[]
}

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks()
  const { locale } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookmarks.length === 0) { setLoading(false); return }
    fetch(`${API_BASE_URL}/api/posts?limit=50`)
      .then(r => r.json())
      .then((data: { posts?: Post[] }) => {
        const all = Array.isArray(data.posts) ? data.posts : []
        setPosts(all.filter(p => bookmarks.includes(String(p.id ?? p._id ?? ''))))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [bookmarks]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-screen bg-canvas text-textPrimary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/posts" className="text-neutral-500 hover:text-neutral-300 text-sm font-mono transition-colors mb-8 inline-block">
          ← {locale === 'ko' ? '블로그로' : 'Back to Blog'}
        </Link>
        <h1 className="text-3xl font-black mb-10">
          {locale === 'ko' ? '북마크' : 'Bookmarks'}
        </h1>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-neutral-900 rounded-lg animate-pulse" />)}</div>
        ) : posts.length === 0 ? (
          <p className="text-neutral-600 font-mono text-sm">
            {locale === 'ko' ? '북마크된 포스트가 없습니다.' : 'No bookmarked posts yet.'}
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => {
              const postId = String(post.id ?? post._id ?? '')
              const dateStr = post.createdAt ?? post.created_at ?? ''
              return (
                <Link key={postId} href={`/posts/${postId}`} className="block p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="text-neutral-200 font-semibold">{post.title}</div>
                  <div className="text-neutral-600 text-xs font-mono mt-1">
                    {dateStr ? new Date(dateStr).toLocaleDateString() : ''}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
