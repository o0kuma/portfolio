import type { HomePost } from '@/components/home/post-types'

function iso(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  try {
    return new Date(v as string).toISOString()
  } catch {
    return ''
  }
}

/** Neon/Postgres row → HomePost (list cards, hero feed). */
export function normalizePostListItem(row: Record<string, unknown>): HomePost {
  return {
    _id: String(row.id ?? row._id ?? ''),
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    author: String(row.author ?? ''),
    category: String(row.category ?? 'general'),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    featured: Boolean(row.featured),
    views: Number(row.views ?? 0),
    likes: Number(row.likes ?? 0),
    comments: Array.isArray(row.comments) ? (row.comments as unknown[]) : [],
    createdAt: iso(row.created_at ?? row.createdAt),
  }
}

/** Same as list item plus updatedAt — used by /posts board. */
export function normalizePostBoardItem(row: Record<string, unknown>): HomePost & { updatedAt: string } {
  return {
    ...normalizePostListItem(row),
    updatedAt: iso(row.updated_at ?? row.updatedAt),
  }
}

export type PostDetailComment = {
  _id: string
  author: string
  content: string
  createdAt: string
}

export type PostDetail = Omit<HomePost, 'comments'> & {
  comments: PostDetailComment[]
  updatedAt: string
}

/** Single post + comment rows from GET /api/posts/:id */
export function normalizePostDetail(row: Record<string, unknown>): PostDetail {
  const base = normalizePostListItem(row)
  const raw = Array.isArray(row.comments) ? row.comments : []
  const comments: PostDetailComment[] = raw.map((c) => {
    const x = c as Record<string, unknown>
    return {
      _id: String(x.id ?? x._id ?? ''),
      author: String(x.author ?? ''),
      content: String(x.content ?? ''),
      createdAt: iso(x.created_at ?? x.createdAt),
    }
  })
  return {
    ...base,
    comments,
    updatedAt: iso(row.updated_at ?? row.updatedAt),
  }
}
