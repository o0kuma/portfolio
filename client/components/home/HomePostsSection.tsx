'use client'

import { useEffect, useState } from 'react'
import BlogPostsAtmosphere from '@/components/home/BlogPostsAtmosphere'
import type { HomePost } from '@/components/home/post-types'
import { normalizePostListItem } from '@/lib/postApi'
import { getApiBaseUrl } from '@/lib/api-base-url'

const API_BASE = getApiBaseUrl()

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatNumber(num: number) {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    tech: 'Tech',
    economy: 'Economy',
    coin: 'Coin',
    travel: 'Travel',
    food: 'Food',
    lottery: 'Lottery',
  }
  return map[cat] || 'General'
}

export default function HomePostsSection() {
  const [posts, setPosts] = useState<HomePost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const params = new URLSearchParams({ page: '1', limit: '12' })
        const res = await fetch(`${API_BASE}/api/posts?${params}`)
        const data = await res.json()
        if (!cancelled && res.ok && data.posts) {
          setPosts(
            (data.posts as Record<string, unknown>[]).map((row) =>
              normalizePostListItem(row),
            ),
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
    <div id="posts-feed">
      <BlogPostsAtmosphere
        posts={posts}
        loading={loading}
        formatDate={formatDate}
        formatNumber={formatNumber}
        categoryLabel={categoryLabel}
      />
    </div>
  )
}
