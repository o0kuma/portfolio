import Link from 'next/link'
import { FiArrowLeft, FiBookOpen, FiCalendar } from 'react-icons/fi'
import { getApiBaseUrl } from '@/lib/api-base-url'

interface SeriesItem {
  name: string
  count: number
  latest: string
}

async function fetchSeries(): Promise<SeriesItem[]> {
  try {
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/api/posts/series`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.series ?? []
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

export const metadata = {
  title: '시리즈 | 블로그',
  description: '연재 시리즈 목록',
}

export default async function SeriesPage() {
  const series = await fetchSeries()

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-800">
        <div className="page-shell py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/posts"
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 font-mono text-sm transition-colors"
            >
              <FiArrowLeft size={16} />
              <span>글 목록</span>
            </Link>
            <h1 className="text-2xl font-black text-neutral-50 font-mono">시리즈</h1>
          </div>
        </div>
      </header>

      <div className="page-shell py-12">
        {series.length === 0 ? (
          <div className="text-center py-20 text-neutral-600 font-mono">
            <FiBookOpen size={48} className="mx-auto mb-4 opacity-40" />
            <p>아직 시리즈가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => (
              <Link
                key={s.name}
                href={`/posts/series/${encodeURIComponent(s.name)}`}
                className="block rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <FiBookOpen className="text-cyan-400 mt-0.5" size={20} />
                  <span className="bg-neutral-800 text-neutral-400 text-xs font-mono px-2 py-0.5 rounded">
                    {s.count}편
                  </span>
                </div>
                <h2 className="text-neutral-100 font-bold text-lg leading-snug mb-3 line-clamp-2">
                  {s.name}
                </h2>
                <div className="flex items-center gap-1 text-neutral-600 text-xs font-mono">
                  <FiCalendar size={11} />
                  <span>최근 {formatDate(s.latest)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
