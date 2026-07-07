import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiArrowLeft, FiCalendar } from 'react-icons/fi'
import { getApiBaseUrl } from '@/lib/api-base-url'
import LocaleText from '@/components/LocaleText'

interface Post {
  id: number
  title: string
  created_at: string
  excerpt?: string
}

async function fetchSeriesPosts(series: string): Promise<Post[]> {
  try {
    const base = getApiBaseUrl()
    const res = await fetch(
      `${base}/api/posts?series=${encodeURIComponent(series)}&limit=100&page=1`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    const rawPosts: Record<string, unknown>[] = Array.isArray(data.posts) ? data.posts : []
    return rawPosts.map((p) => ({
      id: (p.id ?? p._id) as number,
      title: p.title as string,
      created_at: (p.created_at ?? p.createdAt) as string,
      excerpt: p.excerpt as string | undefined,
    }))
  } catch {
    return []
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  return {
    title: `${decoded} 시리즈 | 블로그`,
    description: `${decoded} 연재 시리즈의 모든 글`,
  }
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  const posts = await fetchSeriesPosts(decoded)

  if (posts.length === 0) {
    notFound()
  }

  // Sort by created_at ascending for series order
  const sorted = [...posts].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-800">
        <div className="page-shell py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/posts/series"
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 font-mono text-sm transition-colors"
            >
              <FiArrowLeft size={16} />
              <span><LocaleText ko="시리즈 목록" en="All series" /></span>
            </Link>
            <h1 className="text-2xl font-black text-neutral-50 font-mono">{decoded}</h1>
          </div>
        </div>
      </header>

      <div className="page-shell py-12">
        <div className="mb-8">
          <p className="text-neutral-500 font-mono text-sm"><LocaleText ko={`총 ${sorted.length}편`} en={`${sorted.length} posts total`} /></p>
        </div>

        <ol className="space-y-3">
          {sorted.map((post, idx) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors p-5"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-bold font-mono text-cyan-400">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-neutral-500 mb-1">Part {idx + 1}</p>
                  <h2 className="text-neutral-100 font-semibold leading-snug line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-neutral-500 text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-neutral-700 text-xs font-mono flex-shrink-0">
                  <FiCalendar size={11} />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
