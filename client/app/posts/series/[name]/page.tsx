import Link from 'next/link'
import PageShell from '@/components/site/PageShell'
import { Container, PageHeader } from '@/components/site/layout'
import { notFound } from 'next/navigation'
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
    <PageShell>
      <PageHeader
        eyebrow={<Link href="/posts/series" className="hover:text-fg"><LocaleText ko="시리즈" en="Series" /></Link>}
        title={decoded}
        meta={<LocaleText ko={`총 ${sorted.length}편`} en={`${sorted.length} posts`} />}
      />
      <Container>
        <ol className="grid gap-3">
          {sorted.map((post, idx) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`} className="group flex gap-4 rounded-xl border-2 border-ink bg-white px-5 py-4 shadow-ink-sm transition-transform hover:-translate-y-0.5">
                <span className="w-6 shrink-0 pt-0.5 text-right text-sm tabular-nums text-fg-subtle">{idx + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-fg group-hover:underline">{post.title}</span>
                  {post.excerpt && <span className="mt-1 block line-clamp-2 text-sm text-fg-muted">{post.excerpt}</span>}
                </span>
                <span className="shrink-0 text-xs text-fg-subtle">{formatDate(post.created_at)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </PageShell>
  )
}
