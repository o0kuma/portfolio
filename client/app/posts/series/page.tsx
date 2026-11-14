import Link from 'next/link'
import PageShell from '@/components/site/PageShell'
import { Container, EmptyState, PageHeader } from '@/components/site/layout'
import { getApiBaseUrl } from '@/lib/api-base-url'
import LocaleText from '@/components/LocaleText'

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
  title: 'Series',
  description: '연재 시리즈 목록',
}

export default async function SeriesPage() {
  const series = await fetchSeries()

  return (
    <PageShell>
      <PageHeader
        eyebrow={<Link href="/posts" className="hover:text-fg"><LocaleText ko="글" en="Posts" /></Link>}
        title={<LocaleText ko="시리즈" en="Series" />}
        description={<LocaleText ko="여러 편으로 이어지는 글 묶음입니다." en="Posts written as multi-part series." />}
      />
      <Container>
        {series.length === 0 ? (
          <EmptyState message={<LocaleText ko="아직 시리즈가 없습니다." en="No series yet." />} />
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {series.map((s) => (
              <li key={s.name}>
                <Link href={`/posts/series/${encodeURIComponent(s.name)}`} className="group flex items-baseline justify-between gap-4 py-5">
                  <span className="text-lg font-semibold text-fg group-hover:underline group-hover:decoration-star group-hover:underline-offset-4">{s.name}</span>
                  <span className="shrink-0 text-xs text-fg-subtle">
                    <LocaleText ko={`${s.count}편 · 최근 ${formatDate(s.latest)}`} en={`${s.count} posts · ${formatDate(s.latest)}`} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </PageShell>
  )
}
