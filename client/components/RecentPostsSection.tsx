'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
    <section id="posts" className="py-24 border-b border-neutral-800 bg-neutral-950 text-neutral-100">
      <div className="page-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-12 max-w-xl"
        >
          <p className="text-neutral-600 text-xs font-mono tracking-[0.2em] uppercase mb-3">
            Blog
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-50 mb-2">{t.recentPosts.title}</h2>
          <p className="text-neutral-500">{t.recentPosts.subtitle}</p>
        </motion.div>

        {loading ? (
          <p className="text-neutral-600 font-mono text-sm">{t.recentPosts.loading}</p>
        ) : posts.length === 0 ? (
          <p className="text-neutral-600">{t.recentPosts.empty}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {posts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
                className="rounded-xl p-6 border border-neutral-800 bg-neutral-900/40 hover:border-neutral-600 transition-colors"
              >
                <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border border-neutral-700 text-neutral-400 mb-3">
                  {getCategoryLabel(post.category, locale)}
                </span>
                <h3 className="text-lg font-semibold text-neutral-100 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-neutral-500 text-sm line-clamp-3 mb-4">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-neutral-600 font-mono">
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
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-neutral-50 transition-colors"
                >
                  {t.recentPosts.readMore}
                  <FiArrowRight size={14} />
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-medium hover:border-neutral-500 hover:text-neutral-100 transition-colors"
          >
            {t.recentPosts.viewAll}
            <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
