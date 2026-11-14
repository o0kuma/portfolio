'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'
import Link from 'next/link'
import BlogSearchBar from '../../components/BlogSearchBar'
import AdBanner from '../../components/AdBanner'
import CreatePostForm from '../../components/CreatePostForm'
import { normalizePostBoardItem } from '@/lib/postApi'
import { getApiBaseUrl } from '@/lib/api-base-url'
import { toast } from '@/lib/toast'
import { adminAuthHeaders } from '@/lib/admin-token'
import { hasAdminAccess } from '@/lib/admin-access'
import { useLanguage } from '@/lib/LanguageContext'
import { POST_CATEGORIES, getCategoryLabel } from '@/lib/post-categories'
import PageShell from '@/components/site/PageShell'
import { Container, EmptyState, PageHeader, TabBar, tabClass, buttonQuiet, buttonSecondary } from '@/components/site/layout'
import { plainTextExcerpt } from '@/lib/textExcerpt'

const API_BASE_URL = getApiBaseUrl()
const PAGE_LIMIT = 12

interface Post {
  _id: string
  title: string
  content: string
  author: string
  category: string
  tags: string[]
  featured: boolean
  views: number
  likes: number
  comments: any[]
  createdAt: string
  updatedAt: string
}

export default function PostsListClient() {
  const { locale, t } = useLanguage()
  const [isAdmin, setIsAdmin] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isFetchingMoreRef = useRef(false)

  const categories = [
    { id: 'all', name: t.postsPage.all },
    ...POST_CATEGORIES.map((c) => ({
      id: c.id,
      name: locale === 'ko' ? c.ko : c.en,
    })),
  ]

  useEffect(() => {
    setIsAdmin(hasAdminAccess())
  }, [])

  // 포스트 데이터 가져오기 (append 여부 선택)
  const fetchPosts = useCallback(async (page: number, category: string, search: string, append: boolean) => {
    if (append) {
      setIsFetchingMore(true)
      isFetchingMoreRef.current = true
    } else {
      setIsLoading(true)
    }
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_LIMIT.toString(),
      })
      if (category !== 'all') params.append('category', category)
      if (search) params.append('search', search)

      const response = await fetch(`${API_BASE_URL}/api/posts?${params}`)
      const data = await response.json()

      if (response.ok) {
        const rawPosts = Array.isArray(data.posts)
          ? (data.posts as Record<string, unknown>[])
          : []
        const mapped = rawPosts.map((row) => normalizePostBoardItem(row))
        if (append) {
          setPosts((prev) => [...prev, ...mapped])
        } else {
          setPosts(mapped)
        }
        setHasMore(data.hasMore ?? false)
      } else {
        console.error('Failed to fetch posts:', data.message)
        if (!append) {
          setPosts([])
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      if (!append) {
        setPosts([])
        setHasMore(false)
      }
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
      isFetchingMoreRef.current = false
    }
  }, [])

  // 카테고리/검색어 변경 시 초기화
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchPosts(1, selectedCategory, searchQuery, false)
  }, [selectedCategory, searchQuery, fetchPosts])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && !isFetchingMoreRef.current) {
          setHasMore((more) => {
            if (!more) return more
            setCurrentPage((prev) => {
              const next = prev + 1
              fetchPosts(next, selectedCategory, searchQuery, true)
              return next
            })
            return more
          })
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [selectedCategory, searchQuery, fetchPosts])

  // 클라이언트 필터 (dateRange)
  useEffect(() => {
    let filtered = posts

    if (activeFilters.dateRange && activeFilters.dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.createdAt)
        switch (activeFilters.dateRange) {
          case 'this-year':
            return postDate.getFullYear() === now.getFullYear()
          case 'last-year':
            return postDate.getFullYear() === now.getFullYear() - 1
          case 'this-month':
            return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()
          case 'last-month': {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
            return postDate.getMonth() === lastMonth.getMonth() && postDate.getFullYear() === lastMonth.getFullYear()
          }
          default:
            return true
        }
      })
    }

    setFilteredPosts(filtered)
  }, [posts, activeFilters])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery((prev) => {
      if (prev !== query) setCurrentPage(1)
      return query
    })
  }, [])

  const handleFilterChange = useCallback((filters: any) => {
    setActiveFilters(filters)
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calcReadingTime = (content: string): number => {
    const wordCount = content.trim().split(/\s+/).length
    return Math.max(1, Math.round(wordCount / 200))
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setShowCreateForm(true)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to delete this post?' : '정말로 이 게시글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: adminAuthHeaders(),
      })

      if (response.ok) {
        fetchPosts(1, selectedCategory, searchQuery, false)
        setCurrentPage(1)
      } else {
        const data = await response.json()
        toast.error((locale === 'en' ? 'Delete failed: ' : '삭제 실패: ') + data.message)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(locale === 'en' ? 'An error occurred while deleting.' : '삭제 중 오류가 발생했습니다.')
    }
  }

  const handleCreateSuccess = () => {
    fetchPosts(1, selectedCategory, searchQuery, false)
    setCurrentPage(1)
    setEditingPost(null)
  }

  const isInitialLoad = isLoading && posts.length === 0
  const en = locale === 'en'

  return (
    <PageShell>
      <PageHeader
        title={t.postsPage.title}
        description={en ? 'Tech, money, travel and food, written down as I go.' : '테크, 경제, 여행, 음식 이야기를 그때그때 적습니다.'}
        actions={
          isAdmin ? (
            <button type="button" onClick={() => setShowCreateForm(true)} className={buttonSecondary}>
              <FiPlus size={16} aria-hidden />
              {t.postsPage.newPost}
            </button>
          ) : undefined
        }
      />

      <Container>
        <BlogSearchBar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          placeholder={t.postsPage.searchPlaceholder}
          filters={activeFilters}
        />

        <div className="mt-8">
          <TabBar label={en ? 'Categories' : '분류'}>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={tabClass(selectedCategory === category.id)}
              >
                {category.name}
              </button>
            ))}
            <Link href="/posts/series" className={`${tabClass(false)} ml-auto`}>
              {en ? 'Series' : '시리즈'}
            </Link>
          </TabBar>
        </div>

        {searchQuery && (
          <p className="mt-6 text-sm text-fg-muted">
            {en
              ? `${filteredPosts.length} results for "${searchQuery}"`
              : `"${searchQuery}" 검색 결과 ${filteredPosts.length}개`}
          </p>
        )}

        {isInitialLoad ? (
          <ul className="mt-2 divide-y divide-line" aria-busy="true" aria-label={t.postsPage.loading}>
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="py-6">
                <div className="h-3 w-40 rounded bg-panel" />
                <div className="mt-3 h-5 w-2/3 rounded bg-panel" />
              </li>
            ))}
          </ul>
        ) : filteredPosts.length > 0 ? (
          <ul className="mt-2 divide-y divide-line">
            {filteredPosts.map((post, index) => (
              <React.Fragment key={post._id}>
                <li className="group relative py-6">
                  {/* Ad slot every third post, inside the row so an empty slot leaves no gap */}
                  {index > 0 && index % 3 === 0 && <AdBanner adType="banner" position="middle" className="mb-6 empty:hidden" />}
                  <Link href={`/posts/${post._id}`} className="block">
                    <p className="text-xs text-fg-subtle">
                      {formatDate(post.createdAt)} · {getCategoryLabel(post.category, locale)} ·{' '}
                      {en ? `${calcReadingTime(post.content)} min read` : `${calcReadingTime(post.content)}분`}
                      {post.featured && <span className="ml-2 text-star">{en ? 'Pinned' : '고정'}</span>}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-[1.5] text-fg group-hover:underline group-hover:decoration-star group-hover:underline-offset-4 md:text-xl">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-[1.7] text-fg-muted">{plainTextExcerpt(post.content, 160)}</p>
                  </Link>
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Link
                          key={tag}
                          href={`/posts/tags/${encodeURIComponent(tag)}`}
                          className="text-xs text-fg-subtle hover:text-fg"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="absolute right-0 top-6 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditPost(post)}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-fg-subtle hover:text-fg"
                        aria-label={en ? 'Edit' : '수정'}
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post._id)}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-fg-subtle hover:text-danger"
                        aria-label={en ? 'Delete' : '삭제'}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ul>
        ) : (
          <EmptyState
            message={en ? 'No posts match these filters.' : '조건에 맞는 글이 없습니다.'}
            action={
              selectedCategory !== 'all' || searchQuery ? (
                <button type="button" onClick={() => handleCategoryChange('all')} className={buttonQuiet}>
                  {en ? 'Show all posts' : '전체 글 보기'}
                </button>
              ) : undefined
            }
          />
        )}

        <div ref={sentinelRef} className="h-4" />

        {isFetchingMore && (
          <div className="flex justify-center py-8" aria-label={t.postsPage.loading}>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-fg" />
          </div>
        )}

        {!hasMore && filteredPosts.length > 0 && (
          <p className="py-10 text-center text-xs text-fg-subtle">{en ? "That's every post." : '모든 글을 불러왔습니다.'}</p>
        )}
      </Container>

      <CreatePostForm
        isOpen={showCreateForm}
        onClose={() => { setShowCreateForm(false); setEditingPost(null) }}
        onSuccess={handleCreateSuccess}
        editPost={editingPost}
      />
    </PageShell>
  )
}
