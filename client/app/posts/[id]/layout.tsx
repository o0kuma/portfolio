import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kuuuma.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return { title: '포스트' }
    const post = await res.json()
    const title = post.title ?? '포스트'
    const description = post.preview ?? post.content?.slice(0, 120) ?? ''
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        images: [
          `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&sub=${encodeURIComponent(post.category ?? '')}`,
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    }
  } catch {
    return { title: '포스트' }
  }
}

export default function PostDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
