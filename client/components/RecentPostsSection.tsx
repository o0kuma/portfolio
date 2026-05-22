'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiCalendar, FiEye } from 'react-icons/fi'
import { normalizePostListItem } from '@/lib/postApi'
import { getCategoryLabel } from '@/lib/post-categories'
import { useLanguage } from '@/lib/LanguageContext'
import type { HomePost } from '@/components/home/post-types'

function formatDate(dateString: string, locale: string) {
  return new Date(dateString).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function RecentPostsSection() {
  const { locale, t } = useLanguage()
  const [posts, setPosts] = useState<HomePost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/posts?limit=6')
        const data = await res.json()
        if (!cancelled && res.ok && Array.isArray(data.posts)) {
          setPosts(
            (data.posts as Record<string, unknown>[]).map((row) => normalizePostListItem(row)),
          )
        }
      } catch {
        if (!cancelled) setPosts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="posts" className="py-24 bg-canvas text-textPrimary">
      <div className="page-shell">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.recentPosts.title}</h2>
          <p className="text-textMuted max-w-lg mx-auto">{t.recentPosts.subtitle}</p>
        </div>

        {loading ? (
          <p className="text-center text-textMuted">{t.recentPosts.loading}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-textMuted">{t.recentPosts.empty}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {posts.map((post) => (
              <article
                key={post._id}
                className="glass-panel rounded-2xl p-6 border border-border hover:border-primary-500/40 transition-colors"
              >
                <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-400 mb-3">
                  {getCategoryLabel(post.category, locale)}
                </span>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-textMuted text-sm line-clamp-3 mb-4">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-textMuted">
                  <span className="flex items-center gap-1">
                    <FiCalendar size={12} />
                    {formatDate(post.createdAt, locale)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiEye size={12} />
                    {post.views}
                  </span>
                </div>
                <Link
                  href={`/posts/${post._id}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-accent hover:underline"
                >
                  {t.recentPosts.readMore}
                  <FiArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold hover:brightness-110 transition"
          >
            {t.recentPosts.viewAll}
            <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
