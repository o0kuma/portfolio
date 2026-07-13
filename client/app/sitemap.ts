import { MetadataRoute } from 'next'
import { dbQuery } from '@/lib/neon-server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') ?? 'https://kuuuma.com'

interface PostRow {
  id: string
  updated_at: string | Date | null
  created_at: string | Date
}

async function getPostEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const result = await dbQuery<PostRow>(
      `SELECT id, updated_at, created_at FROM posts WHERE status = 'published' ORDER BY created_at DESC`,
    )
    return result.rows.map((post) => ({
      url: `${BASE_URL}/posts/${post.id}`,
      lastModified: new Date(post.updated_at ?? post.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch {
    // Sitemap generation shouldn't fail the whole route if the DB is briefly unavailable.
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const postEntries = await getPostEntries()

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/games`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tower-defense`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tetris`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/survive`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/portfolio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/posts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    ...postEntries,
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]
}
