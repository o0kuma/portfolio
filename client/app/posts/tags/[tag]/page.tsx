import Link from 'next/link'
import PageShell from '@/components/site/PageShell'
import LocaleText from '@/components/LocaleText'
import { Container, EmptyState, PageHeader } from '@/components/site/layout'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ tag: string }> }

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/posts?tag=${encodeURIComponent(decoded)}`, {
    cache: 'no-store',
  }).catch(() => null)
  if (!res?.ok) notFound()

  const data = await res.json() as { posts?: Array<{ id: string; title: string; created_at: string }> }
  const posts = Array.isArray(data.posts) ? data.posts : []

  return (
    <PageShell>
      <PageHeader
        eyebrow={<Link href="/posts" className="hover:text-fg"><LocaleText ko="글 · 태그" en="Posts · Tag" /></Link>}
        title={`#${decoded}`}
        meta={<LocaleText ko={`글 ${posts.length}개`} en={`${posts.length} posts`} />}
      />
      <Container>
        {posts.length === 0 ? (
          <EmptyState message={<LocaleText ko="이 태그가 달린 글이 없습니다." en="No posts with this tag." />} />
        ) : (
          <ul className="grid gap-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/posts/${post.id}`} className="group block rounded-xl border-2 border-ink bg-white px-5 py-4 shadow-ink-sm transition-transform hover:-translate-y-0.5">
                  <span className="block text-xs text-fg-subtle">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  <span className="mt-1 block text-base font-semibold text-fg group-hover:underline">{post.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </PageShell>
  )
}
