'use client'

import { useState, useEffect, useOptimistic } from 'react'
import { FiArrowLeft, FiEye, FiHeart, FiMessageSquare, FiCalendar, FiUser, FiTag, FiEdit, FiTrash2, FiClock } from 'react-icons/fi'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AdBanner from '@/components/AdBanner'
import { insertAdsInContent } from '@/components/InArticleAd'
import { normalizePostDetail, type PostDetail } from '@/lib/postApi'
import { getApiBaseUrl } from '@/lib/api-base-url'
import CreatePostForm from '@/components/CreatePostForm'
import { adminAuthHeaders } from '@/lib/admin-token'
import { toast } from '@/lib/toast'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import PostShareBar from '@/components/blog/PostShareBar'
import CommentSection from '@/components/blog/CommentSection'
import BookmarkButton from '@/components/blog/BookmarkButton'

const API_BASE_URL = getApiBaseUrl()

type Post = PostDetail

interface TocItem {
  level: number
  text: string
  slug: string
}

interface RelatedPost {
  _id: string
  title: string
  createdAt: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
}

function parseHeadings(content: string): TocItem[] {
  const lines = content.split('\n')
  const items: TocItem[] = []
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) {
      const text = h3[1].trim()
      items.push({ level: 3, text, slug: slugify(text) })
    } else if (h2) {
      const text = h2[1].trim()
      items.push({ level: 2, text, slug: slugify(text) })
    }
  }
  return items
}

function calcReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.id as string
  const { t, locale } = useLanguage()

  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    post?.likes ?? 0,
    (current: number) => current + 1,
  )
  const [showEditForm, setShowEditForm] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [seriesPosts, setSeriesPosts] = useState<RelatedPost[]>([])

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`)
      const data = await response.json()

      if (response.ok) {
        setPost(normalizePostDetail(data as Record<string, unknown>))
      } else {
        console.error('Failed to fetch post:', data.message)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedPosts = async (currentPost: Post) => {
    try {
      const params = new URLSearchParams({ page: '1', limit: '10' })
      const response = await fetch(`${API_BASE_URL}/api/posts?${params}`)
      if (!response.ok) return
      const data = await response.json()
      const allPosts = Array.isArray(data.posts) ? (data.posts as Record<string, unknown>[]) : []

      const others = allPosts.filter((p) => String(p.id ?? p._id ?? '') !== currentPost._id)

      let related: RelatedPost[]
      if (currentPost.tags.length > 0) {
        const withTags = others.filter((p) => {
          const tags = Array.isArray(p.tags) ? (p.tags as string[]) : []
          return tags.some((tag) => currentPost.tags.includes(tag))
        })
        const source = withTags.length > 0 ? withTags : others
        related = source.slice(0, 3).map((p) => ({
          _id: String(p.id ?? p._id ?? ''),
          title: String(p.title ?? ''),
          createdAt: String(p.created_at ?? p.createdAt ?? ''),
        }))
      } else {
        related = others.slice(0, 3).map((p) => ({
          _id: String(p.id ?? p._id ?? ''),
          title: String(p.title ?? ''),
          createdAt: String(p.created_at ?? p.createdAt ?? ''),
        }))
      }
      setRelatedPosts(related)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const fetchSeriesPosts = async (currentPost: Post) => {
    if (!currentPost.series) return
    try {
      const params = new URLSearchParams({ series: currentPost.series, limit: '20' })
      const response = await fetch(`${API_BASE_URL}/api/posts?${params}`)
      if (!response.ok) return
      const data = await response.json()
      const allPosts = Array.isArray(data.posts) ? (data.posts as Record<string, unknown>[]) : []
      const others = allPosts
        .filter((p) => String(p.id ?? p._id ?? '') !== currentPost._id)
        .map((p) => ({
          _id: String(p.id ?? p._id ?? ''),
          title: String(p.title ?? ''),
          createdAt: String(p.created_at ?? p.createdAt ?? ''),
        }))
      setSeriesPosts(others)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (post) {
      fetchRelatedPosts(post)
      fetchSeriesPosts(post)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?._id])

  const handleLike = async () => {
    if (isLiking) return

    try {
      setIsLiking(true)
      addOptimisticLike(undefined)
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchPost()
      }
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm(t.postDetail.deleteConfirm)) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: adminAuthHeaders(),
      })

      if (response.ok) {
        window.location.href = '/posts'
      } else {
        const data = await response.json()
        toast.error(t.postDetail.deleteFailed + data.message)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(t.postDetail.deleteError)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-50">
        <div className="page-shell py-16">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-neutral-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-cyan-400 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-mono text-neutral-400 mb-2">
                {t.postDetail.loading}
              </h3>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-50">
        <div className="page-shell py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-100 mb-4">
              {t.postDetail.notFound}
            </h2>
            <p className="text-neutral-500 mb-8">
              {t.postDetail.notFoundDetail}
            </p>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 font-mono text-sm transition-colors"
            >
              <FiArrowLeft size={16} />
              <span>{t.postDetail.backToPosts}</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const readingTime = calcReadingTime(post.content)
  const tocItems = parseHeadings(post.content)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="page-shell py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/posts"
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 font-mono text-sm transition-colors"
            >
              <FiArrowLeft size={16} />
              {t.postDetail.backToBoard}
            </Link>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowEditForm(true)}
                className="p-2 text-neutral-700 hover:text-neutral-400 transition-colors"
                title="수정"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={handleDeletePost}
                className="p-2 text-neutral-700 hover:text-neutral-400 transition-colors"
                title="삭제"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell py-8">
        {/* Layout: main content + optional ToC sidebar on xl */}
        <div className="mx-auto max-w-6xl flex gap-8 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
                {post.featured && (
                  <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                    Featured
                  </span>
                )}
                <span className="bg-neutral-800 text-neutral-500 text-[10px] font-mono px-2 py-0.5 rounded uppercase">
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-neutral-50 leading-tight mb-4">
                {post.title}
              </h1>

              {/* Share bar below title */}
              <div className="flex items-center gap-3 mb-4">
                <PostShareBar title={post.title} />
                <BookmarkButton postId={post._id} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-600 mb-6">
                <div className="flex items-center gap-1">
                  <FiUser size={13} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiCalendar size={13} />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock size={13} />
                  <span>{interpolate(t.postDetail.readingTime, { n: readingTime })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiEye size={13} />
                  <span>{formatNumber(post.views)}</span>
                </div>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center gap-1.5 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <FiHeart size={13} />
                  <span>{formatNumber(optimisticLikes)}</span>
                </button>
                <div className="flex items-center gap-1">
                  <FiMessageSquare size={13} />
                  <span>{formatNumber(post.comments.length)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/posts/tags/${encodeURIComponent(tag)}`}
                    className="bg-neutral-800 text-neutral-500 text-xs font-mono px-2.5 py-1 rounded-md flex items-center gap-1 hover:text-neutral-300 transition-colors"
                  >
                    <FiTag size={11} />
                    {tag}
                  </Link>
                ))}
              </div>

              <div className="text-neutral-300 leading-relaxed prose prose-invert prose-neutral max-w-none">
                <div className="mb-8">
                  <AdBanner
                    adType="banner"
                    position="top"
                    postId={post._id}
                    postCategory={post.category}
                    postTags={post.tags}
                  />
                </div>

                <div className="whitespace-pre-wrap">
                  {insertAdsInContent(post.content, post._id, post.category, post.tags)}
                </div>

                <div className="mt-8">
                  <AdBanner
                    adType="banner"
                    position="bottom"
                    postId={post._id}
                    postCategory={post.category}
                    postTags={post.tags}
                  />
                </div>
              </div>
            </div>

            {/* Series posts */}
            {post.series && seriesPosts.length > 0 && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-[0.2em]">
                    이 시리즈의 다른 글
                  </h3>
                  <span className="text-xs font-mono text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    {post.series}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {seriesPosts.map((sp) => (
                    <Link
                      key={sp._id}
                      href={`/posts/${sp._id}`}
                      className="block rounded-lg border border-neutral-800 p-4 hover:border-cyan-800 transition-colors group"
                    >
                      <h4 className="font-semibold text-neutral-200 group-hover:text-white line-clamp-2 mb-2 text-sm transition-colors">
                        {sp.title}
                      </h4>
                      <p className="text-xs font-mono text-neutral-700 mb-3">
                        {formatDateShort(sp.createdAt)}
                      </p>
                      <span className="text-xs font-mono text-cyan-400 hover:text-cyan-300">
                        읽기 &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 mb-8">
                <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-[0.2em] mb-4">
                  {t.postDetail.relatedPosts}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp._id}
                      href={`/posts/${rp._id}`}
                      className="block rounded-lg border border-neutral-800 p-4 hover:border-neutral-700 transition-colors group"
                    >
                      <h4 className="font-semibold text-neutral-200 group-hover:text-white line-clamp-2 mb-2 text-sm transition-colors">
                        {rp.title}
                      </h4>
                      <p className="text-xs font-mono text-neutral-700 mb-3">
                        {formatDateShort(rp.createdAt)}
                      </p>
                      <span className="text-xs font-mono text-cyan-400 hover:text-cyan-300">
                        {t.postDetail.readMore}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8">
              <CommentSection postId={postId} />
            </div>
          </div>

          {/* ToC sidebar — visible only on xl+ */}
          {tocItems.length > 0 && (
            <aside className="hidden xl:block w-64 shrink-0">
              <nav
                className="sticky rounded-xl bg-neutral-900/50 border border-neutral-800 p-5"
                style={{ top: '6rem' }}
                aria-label={t.postDetail.tableOfContents}
              >
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-[0.2em] mb-3">
                  {t.postDetail.tableOfContents}
                </p>
                <ul className="text-xs font-mono text-neutral-600 space-y-1">
                  {tocItems.map((item, idx) => (
                    <li key={idx} className={item.level === 3 ? 'pl-4' : ''}>
                      <a
                        href={`#${item.slug}`}
                        className="block hover:text-neutral-300 transition-colors py-0.5 truncate"
                        title={item.text}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>

      {post && (
        <CreatePostForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => { setShowEditForm(false); fetchPost() }}
          editPost={post}
        />
      )}
    </div>
  )
}
