export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { dbQuery } from '@/lib/neon-server'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') ?? 'https://kuuuma.com'

interface PostRow {
  id: string
  title: string
  content: string
  author: string
  category: string
  created_at: string | Date
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(): Promise<Response> {
  try {
    const result = await dbQuery<PostRow>(
      `SELECT id, title, content, author, category, created_at
       FROM posts
       WHERE status = 'published'
       ORDER BY created_at DESC
       LIMIT 20`,
      [],
    )

    const items = result.rows
      .map((post) => {
        const pubDate = new Date(post.created_at).toUTCString()
        const link = `${BASE_URL}/posts/${post.id}`
        const description = post.content.replace(/<[^>]*>/g, '').slice(0, 300)
        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <author>${escapeXml(post.author)}</author>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
    </item>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>iykyk Blog</title>
    <description>Latest posts from iykyk</description>
    <link>${BASE_URL}/posts</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[/rss.xml GET]', msg)
    return new Response(`RSS feed error: ${msg}`, { status: 500 })
  }
}
