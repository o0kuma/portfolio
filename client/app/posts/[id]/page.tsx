'use client'

import { useState, useEffect } from 'react'
import { FiArrowLeft, FiEye, FiHeart, FiMessageSquare, FiCalendar, FiUser, FiTag, FiEdit, FiTrash2, FiSend, FiClock } from 'react-icons/fi'
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

const API_BASE_URL = getApiBaseUrl()

type Post = PostDetail

interface Comment {
  author: string
  content: string
}

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
  const [newComment, setNewComment] = useState<Comment>({ author: '', content: '' })
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])

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

  useEffect(() => {
    if (post) {
      fetchRelatedPosts(post)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?._id])

  const handleLike = async () => {
    if (isLiking) return

    try {
      setIsLiking(true)
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.author.trim() || !newComment.content.trim()) {
      toast.warning(t.postDetail.commentRequired)
      return
    }

    try {
      setIsSubmittingComment(true)
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
      })

      if (response.ok) {
        setNewComment({ author: '', content: '' })
        fetchPost()
      } else {
        const data = await response.json()
        toast.error(t.postDetail.commentFailed + data.message)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error(t.postDetail.commentError)
    } finally {
      setIsSubmittingComment(false)
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
      <div className="min-h-screen bg-canvas text-textPrimary">
        <div className="page-shell py-16">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 border-r-primary-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
      <div className="min-h-screen bg-canvas text-textPrimary">
        <div className="page-shell py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {t.postDetail.notFound}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t.postDetail.notFoundDetail}
            </p>
            <Link
              href="/posts"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <FiArrowLeft size={20} />
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
    <div className="min-h-screen bg-canvas text-textPrimary">
      <div className="border-b border-border glass-panel">
        <div className="page-shell py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/posts"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <FiArrowLeft size={20} className="mr-2" />
              {t.postDetail.backToBoard}
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                title="수정"
              >
                <FiEdit size={20} />
              </button>
              <button
                onClick={handleDeletePost}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="삭제"
              >
                <FiTrash2 size={20} />
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
            <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
                {post.featured && (
                  <span className="px-3 py-1 bg-primary-600 text-white text-sm rounded-full font-medium">
                    Featured
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.category === 'tech' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  post.category === 'project' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  post.category === 'update' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {post.category === 'tech' ? '기술' :
                   post.category === 'project' ? '프로젝트' :
                   post.category === 'update' ? '업데이트' : '일반'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                {post.title}
              </h1>

              {/* Share bar below title */}
              <PostShareBar title={post.title} />

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <FiUser size={16} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar size={16} />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock size={16} />
                  <span>{interpolate(t.postDetail.readingTime, { n: readingTime })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiEye size={16} />
                  <span>{formatNumber(post.views)}</span>
                </div>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center gap-2 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <FiHeart size={16} />
                  <span>{formatNumber(post.likes)}</span>
                </button>
                <div className="flex items-center gap-2">
                  <FiMessageSquare size={16} />
                  <span>{formatNumber(post.comments.length)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 text-sm rounded-md flex items-center gap-1"
                  >
                    <FiTag size={14} />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
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

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  {t.postDetail.relatedPosts}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp._id}
                      href={`/posts/${rp._id}`}
                      className="block p-4 rounded-xl border border-border hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all group"
                    >
                      <h4 className="font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 mb-2 text-sm">
                        {rp.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {formatDateShort(rp.createdAt)}
                      </p>
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {t.postDetail.readMore}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                {interpolate(t.postDetail.comments, { n: post.comments.length })}
              </h3>

              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder={t.postDetail.commentAuthorPlaceholder}
                    value={newComment.author}
                    onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                    className="input-field"
                    required
                  />
                  <div className="flex">
                    <textarea
                      placeholder={t.postDetail.commentPlaceholder}
                      value={newComment.content}
                      onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                      className="input-field flex-1 mr-2"
                      rows={3}
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="btn-primary px-4 py-2 disabled:opacity-50"
                    >
                      <FiSend size={20} />
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-4">
                {post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="border-l-4 border-primary-200 dark:border-primary-800 pl-4 py-2"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {comment.author}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FiMessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{t.postDetail.noComments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ToC sidebar — visible only on xl+ */}
          {tocItems.length > 0 && (
            <aside className="hidden xl:block w-64 shrink-0">
              <nav
                className="sticky rounded-xl bg-white dark:bg-dark-900 shadow-lg p-5"
                style={{ top: '6rem' }}
                aria-label={t.postDetail.tableOfContents}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  {t.postDetail.tableOfContents}
                </p>
                <ul className="space-y-1">
                  {tocItems.map((item, idx) => (
                    <li key={idx} className={item.level === 3 ? 'pl-4' : ''}>
                      <a
                        href={`#${item.slug}`}
                        className="block text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-0.5 truncate"
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
