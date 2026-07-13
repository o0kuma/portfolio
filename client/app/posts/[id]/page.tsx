import type { Metadata } from 'next'
import { dbQuery } from '@/lib/neon-server'
import { getSiteUrl, SITE_NAME } from '@/lib/site'
import { plainTextExcerpt } from '@/lib/textExcerpt'
import PostDetailClient from './PostDetailClient'

interface PostRow {
  title: string
  content: string
  category: string | null
  created_at: string | Date
  updated_at: string | Date | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const siteUrl = getSiteUrl()

  try {
    const result = await dbQuery<PostRow>(
      `SELECT title, content, category, created_at, updated_at FROM posts WHERE id = $1 LIMIT 1`,
      [id],
    )
    const post = result.rows[0]
    if (!post) return {}

    const description = plainTextExcerpt(post.content)
    const ogImage = `/api/og?title=${encodeURIComponent(post.title)}${post.category ? `&category=${encodeURIComponent(post.category)}` : ''}`
    const url = `${siteUrl}/posts/${id}`

    return {
      title: post.title,
      description,
      alternates: { canonical: `/posts/${id}` },
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        url,
        publishedTime: new Date(post.created_at).toISOString(),
        modifiedTime: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
        images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: [ogImage],
      },
    }
  } catch {
    // DB unavailable at build/request time shouldn't break the page — fall
    // back to the root layout's generic metadata.
    return {}
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const siteUrl = getSiteUrl()

  let jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteUrl}/posts/${id}`,
    mainEntityOfPage: `${siteUrl}/posts/${id}`,
    publisher: { '@type': 'Organization', name: SITE_NAME },
  }

  try {
    const result = await dbQuery<PostRow & { author: string | null }>(
      `SELECT title, content, category, created_at, updated_at, author FROM posts WHERE id = $1 LIMIT 1`,
      [id],
    )
    const post = result.rows[0]
    if (post) {
      jsonLd = {
        ...jsonLd,
        headline: post.title,
        description: plainTextExcerpt(post.content),
        datePublished: new Date(post.created_at).toISOString(),
        dateModified: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
        author: { '@type': 'Person', name: post.author ?? SITE_NAME },
      }
    }
  } catch {
    // Fall back to the minimal jsonLd above.
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetailClient />
    </>
  )
}
