import Link from 'next/link'
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
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/posts" className="text-neutral-500 hover:text-neutral-300 text-sm font-mono mb-8 inline-block">
          ← Blog
        </Link>
        <div className="flex items-center gap-3 mb-10">
          <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">Tag</span>
          <h1 className="text-3xl font-black">#{decoded}</h1>
          <span className="text-neutral-600 text-sm font-mono">{posts.length} posts</span>
        </div>
        {posts.length === 0 ? (
          <p className="text-neutral-600 font-mono text-sm">No posts with this tag.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.id} href={`/posts/${post.id}`} className="block p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors group">
                <div className="text-neutral-200 font-semibold group-hover:text-white transition-colors">{post.title}</div>
                <div className="text-neutral-600 text-xs font-mono mt-1">{new Date(post.created_at).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
