'use client'

import { useEffect, useState } from 'react'

interface ActivityItem {
  id: string
  timestamp: string
  label: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function RecentActivity() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const results: ActivityItem[] = []

      // Fetch recent posts
      try {
        const r = await fetch('/api/posts?limit=3')
        const data = await r.json()
        if (Array.isArray(data.posts)) {
          for (const p of data.posts) {
            results.push({
              id: `post-${p.id}`,
              timestamp: p.created_at,
              label: `새 글: ${p.title}`,
            })
          }
        }
      } catch {
        // ignore
      }

      // Fetch top tetris score
      try {
        const r = await fetch('/api/tetris/scores?limit=1')
        const data = await r.json()
        if (Array.isArray(data.scores) && data.scores.length > 0) {
          const top = data.scores[0]
          results.push({
            id: `tetris-${top.playerName}`,
            timestamp: top.createdAt,
            label: `테트리스 최고기록: ${top.score.toLocaleString()}점 (${top.playerName})`,
          })
        }
      } catch {
        // ignore
      }

      // Sort by timestamp desc, take 5
      results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setItems(results.slice(0, 5))
      setLoading(false)
    }

    load()
  }, [])

  if (loading || items.length === 0) return null

  return (
    <section className="mx-auto max-w-2xl px-6 py-8">
      <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
        최근 활동
      </h2>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-neutral-600">
              {formatDate(item.timestamp)}
            </span>
            <span className="text-xs text-neutral-400 leading-relaxed">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
