import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  _id?: string
  title: string
  created_at?: string
  createdAt?: string
  tags?: string[]
}

type Props = { params: Promise<{ tag: string }> }

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(
    `${baseUrl}/api/posts?tag=${encodeURIComponent(decodedTag)}&limit=50`,
    { cache: 'no-store' },
  ).catch(() => null)

  if (!res?.ok) notFound()

  const data = await res.json() as { posts?: Post[] }
  const posts = Array.isArray(data.posts) ? data.posts : []

  return (
    <main className="min-h-screen bg-canvas text-textPrimary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/posts" className="text-neutral-500 hover:text-neutral-300 text-sm font-mono transition-colors mb-8 inline-block">
          ← Blog
        </Link>
        <div className="flex items-center gap-3 mb-10">
          <span className="text-cyan-400 text-xs font-mono tracking-[0.2em] uppercase">Tag</span>
          <h1 className="text-3xl font-black">#{decodedTag}</h1>
          <span className="text-neutral-600 text-sm font-mono">{posts.length} posts</span>
        </div>
        {posts.length === 0 ? (
          <p className="text-neutral-600 font-mono text-sm">No posts with this tag.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => {
              const postId = String(post.id ?? post._id ?? '')
              const dateStr = post.createdAt ?? post.created_at ?? ''
              return (
                <Link key={postId} href={`/posts/${postId}`} className="block p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors group">
                  <div className="text-neutral-200 font-semibold group-hover:text-white transition-colors">{post.title}</div>
                  <div className="text-neutral-600 text-xs font-mono mt-1">
                    {dateStr ? new Date(dateStr).toLocaleDateString() : ''}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
