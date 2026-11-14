'use client'

import { useState, useEffect, useOptimistic, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { FiArrowLeft, FiHeart, FiEdit, FiTrash2 } from 'react-icons/fi'
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
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import PageShell from '@/components/site/PageShell'
import { Container, buttonSecondary } from '@/components/site/layout'
import { hasAdminAccess } from '@/lib/admin-access'
import { getCategoryLabel } from '@/lib/post-categories'

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
    // Keep Hangul: `\w` is ASCII-only, so Korean headings used to slug to ''.
    .replace(/[^\w\s\u3131-\u318e\uac00-\ud7a3-]/g, '')
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

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  return ''
}

// Post bodies are Markdown. Headings get the same ids the table of contents
// links to (see parseHeadings), so its links actually jump.
const MARKDOWN_COMPONENTS: Components = {
  h2: ({ children }) => <h2 id={slugify(nodeText(children).trim())} className="scroll-mt-24">{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(nodeText(children).trim())} className="scroll-mt-24">{children}</h3>,
}

function calcReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

export default function PostDetailClient() {
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
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Edit/delete controls are for the site admin only.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAdmin(hasAdminAccess())
  }, [])

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
    return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', {
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

  const en = locale === 'en'

  if (isLoading) {
    return (
      <PageShell>
        <Container width="reading" className="pt-20" >
          <div aria-busy="true" aria-label={t.postDetail.loading} className="space-y-4">
            <div className="h-3 w-40 rounded bg-panel" />
            <div className="h-9 w-3/4 rounded bg-panel" />
            <div className="h-4 w-full rounded bg-panel" />
            <div className="h-4 w-5/6 rounded bg-panel" />
          </div>
        </Container>
      </PageShell>
    )
  }

  if (!post) {
    return (
      <PageShell>
        <Container width="reading" className="pt-20 text-center">
          <h1 className="text-2xl font-bold text-fg">{t.postDetail.notFound}</h1>
          <p className="mt-3 text-fg-muted">{t.postDetail.notFoundDetail}</p>
          <Link href="/posts" className={`${buttonSecondary} mt-8`}>
            <FiArrowLeft size={16} aria-hidden />
            {t.postDetail.backToPosts}
          </Link>
        </Container>
      </PageShell>
    )
  }

  const handleToggleSummary = async () => {
    if (summaryOpen) {
      setSummaryOpen(false)
      return
    }
    setSummaryOpen(true)
    if (summary !== null) return
    setSummaryLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}/summary`)
      const data = await res.json() as { summary?: string; message?: string }
      setSummary(data.summary ?? data.message ?? (locale === 'en' ? "Couldn't load the summary." : '요약을 불러올 수 없습니다.'))
    } catch {
      setSummary(locale === 'en' ? 'An error occurred while loading the summary.' : '요약을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setSummaryLoading(false)
    }
  }

  const readingTime = calcReadingTime(post.content)
  const tocItems = parseHeadings(post.content)

  return (
    <PageShell>
      <div className="mx-auto flex max-w-wide justify-center gap-12 px-5 pt-12 md:px-8 md:pt-16">
        <article className="w-full min-w-0 max-w-reading">
          <div className="flex items-center justify-between">
            <Link href="/posts" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
              <FiArrowLeft size={14} aria-hidden />
              {en ? 'Posts' : '글 목록'}
            </Link>
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowEditForm(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-fg-subtle hover:text-fg"
                  aria-label={en ? 'Edit' : '수정'}
                >
                  <FiEdit size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleDeletePost}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-fg-subtle hover:text-danger"
                  aria-label={en ? 'Delete' : '삭제'}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <header className="mt-8">
            <p className="text-xs text-fg-subtle">
              {getCategoryLabel(post.category, locale)} · {formatDate(post.createdAt)} ·{' '}
              {interpolate(t.postDetail.readingTime, { n: readingTime })}
            </p>
            <h1 className="mt-3 text-[32px] font-bold leading-[1.3] tracking-[-0.02em] text-fg md:text-[40px]">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-subtle">
              <span>{post.author}</span>
              <span>{en ? `${formatNumber(post.views)} views` : `조회 ${formatNumber(post.views)}`}</span>
              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking}
                className="inline-flex items-center gap-1 transition-colors hover:text-fg disabled:opacity-50"
                aria-label={en ? 'Like' : '좋아요'}
              >
                <FiHeart size={12} aria-hidden />
                {formatNumber(optimisticLikes)}
              </button>
              <span className="ml-auto flex items-center gap-2">
                <PostShareBar title={post.title} />
                <BookmarkButton postId={post._id} />
              </span>
            </div>
          </header>

          <div className="mt-8 rounded-xl border border-line">
            <button
              type="button"
              onClick={handleToggleSummary}
              aria-expanded={summaryOpen}
              className="flex w-full items-center justify-between px-4 py-3 text-sm text-fg-muted transition-colors hover:text-fg"
            >
              <span>{en ? 'AI summary' : 'AI 요약 보기'}</span>
              {summaryOpen ? <FiChevronUp size={15} aria-hidden /> : <FiChevronDown size={15} aria-hidden />}
            </button>
            {summaryOpen && (
              <div className="border-t border-line px-4 pb-4 pt-3">
                {summaryLoading ? (
                  <p className="text-sm text-fg-subtle">{en ? 'Writing the summary…' : '요약을 만드는 중입니다…'}</p>
                ) : (
                  <p className="whitespace-pre-line text-sm leading-[1.75] text-fg-muted">{summary}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-10">
            <AdBanner adType="banner" position="top" postId={post._id} postCategory={post.category} postTags={post.tags} />
          </div>

          <div className="prose prose-invert mt-6 max-w-none text-base leading-[1.75] text-fg prose-headings:tracking-[-0.02em] prose-a:text-fg prose-a:decoration-star">
            {insertAdsInContent(post.content, post._id, post.category, post.tags).map((chunk, i) =>
              typeof chunk === 'string' ? (
                chunk.trim() ? (
                  <ReactMarkdown key={`md-${i}`} components={MARKDOWN_COMPONENTS}>
                    {chunk}
                  </ReactMarkdown>
                ) : null
              ) : (
                chunk
              ),
            )}
          </div>

          <div className="mt-10">
            <AdBanner adType="banner" position="bottom" postId={post._id} postCategory={post.category} postTags={post.tags} />
          </div>

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-6">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/posts/tags/${encodeURIComponent(tag)}`} className="text-sm text-fg-muted hover:text-fg">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {post.series && seriesPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xs text-fg-subtle">
                {en ? 'More in this series' : '이 시리즈의 다른 글'} · {post.series}
              </h2>
              <ul className="mt-2 divide-y divide-line">
                {seriesPosts.map((sp) => (
                  <li key={sp._id}>
                    <Link href={`/posts/${sp._id}`} className="group block py-3">
                      <p className="text-xs text-fg-subtle">{formatDateShort(sp.createdAt)}</p>
                      <p className="mt-1 text-sm text-fg group-hover:underline group-hover:decoration-star group-hover:underline-offset-4">{sp.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xs text-fg-subtle">{t.postDetail.relatedPosts}</h2>
              <ul className="mt-2 divide-y divide-line">
                {relatedPosts.map((rp) => (
                  <li key={rp._id}>
                    <Link href={`/posts/${rp._id}`} className="group block py-3">
                      <p className="text-xs text-fg-subtle">{formatDateShort(rp.createdAt)}</p>
                      <p className="mt-1 text-sm text-fg group-hover:underline group-hover:decoration-star group-hover:underline-offset-4">{rp.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-12 border-t border-line pt-8">
            <CommentSection postId={postId} />
          </section>
        </article>

        {tocItems.length > 0 && (
          <aside className="hidden w-56 shrink-0 xl:block">
            <nav className="sticky top-24" aria-label={t.postDetail.tableOfContents}>
              <p className="mb-3 text-xs text-fg-subtle">{t.postDetail.tableOfContents}</p>
              <ul className="space-y-1 border-l border-line text-sm">
                {tocItems.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={`#${item.slug}`}
                      className={`block truncate py-1 text-fg-muted transition-colors hover:text-fg ${item.level === 3 ? 'pl-7' : 'pl-4'}`}
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

      {post && (
        <CreatePostForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => { setShowEditForm(false); fetchPost() }}
          editPost={post}
        />
      )}
    </PageShell>
  )
}
