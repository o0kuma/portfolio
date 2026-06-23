'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FiArrowLeft, FiEye, FiHeart, FiMessageSquare, FiCalendar, FiUser, FiTag, FiEdit, FiTrash2, FiPlus, FiClock } from 'react-icons/fi'
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

export default function PostsPage() {
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
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
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
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return

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
        toast.error('삭제 실패: ' + data.message)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchPosts(1, selectedCategory, searchQuery, false)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleCreateSuccess = () => {
    fetchPosts(1, selectedCategory, searchQuery, false)
    setCurrentPage(1)
    setEditingPost(null)
  }

  const isInitialLoad = isLoading && posts.length === 0

  if (isInitialLoad) {
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
                {t.postsPage.loading}
              </h3>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-50">
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-800">
        <div className="page-shell py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 font-mono text-sm transition-colors"
              >
                <FiArrowLeft size={16} />
                <span>{t.postsPage.home}</span>
              </Link>
              <h1 className="text-2xl font-black text-neutral-50 font-mono">
                {t.postsPage.title}
              </h1>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-neutral-200 text-sm px-3 py-1.5 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <FiPlus size={16} />
                <span>{t.postsPage.newPost}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="page-shell relative z-10 py-12">
        <div className="relative z-[100] mb-10">
          <div className="max-w-4xl mx-auto">
            <BlogSearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              placeholder={t.postsPage.searchPlaceholder}
              filters={activeFilters}
              className="max-w-4xl mx-auto"
            />
          </div>
        </div>

        <div className="relative z-10 mb-12 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.id)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                  : 'text-neutral-600 hover:text-neutral-400 border border-transparent'
              }`}
            >
              {category.name}
            </button>
          ))}
          <Link
            href="/posts/series"
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-neutral-700 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            📚 시리즈
          </Link>
        </div>

        {searchQuery && (
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-lg border border-neutral-800">
              <p className="text-neutral-500 font-mono text-sm">
                &quot;<span className="text-cyan-400">{searchQuery}</span>&quot; —{' '}
                <span className="text-neutral-300">{filteredPosts.length}</span> results
              </p>
            </div>
          </div>
        )}

        {/* 포스트 그리드 */}
        {filteredPosts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mb-12">
            {filteredPosts.map((post, index) => (
              <React.Fragment key={post._id}>
                {/* 3개 포스트마다 광고 삽입 */}
                {index > 0 && index % 3 === 0 && (
                  <div className="col-span-full my-6">
                    <AdBanner
                      adType="banner"
                      position="middle"
                      className="my-4"
                    />
                  </div>
                )}
                <div className="relative group">
                  <Link
                    href={`/posts/${post._id}`}
                    className="group block rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors overflow-hidden"
                  >
                    {/* 포스트 헤더 */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {post.featured && (
                            <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          <span className="bg-neutral-800 text-neutral-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                            {getCategoryLabel(post.category, locale)}
                          </span>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center space-x-1" onClick={(e) => e.preventDefault()}>
                            <button
                              onClick={(e) => { e.preventDefault(); handleEditPost(post) }}
                              className="p-1 text-neutral-700 hover:text-neutral-400 transition-colors"
                              title="수정"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); handleDeletePost(post._id) }}
                              className="p-1 text-neutral-700 hover:text-neutral-400 transition-colors"
                              title="삭제"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 className="text-neutral-100 font-bold text-base leading-snug group-hover:text-white transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h3>

                      <p className="text-neutral-500 text-sm line-clamp-3 mb-4">
                        {post.content}
                      </p>

                      {/* 태그 chips (first 2) */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4" onClick={(e) => e.preventDefault()}>
                          {post.tags.slice(0, 2).map((tag) => (
                            <Link
                              key={tag}
                              href={`/posts/tags/${encodeURIComponent(tag)}`}
                              className="bg-neutral-800 text-neutral-500 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 hover:text-neutral-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiTag size={10} />
                              {tag}
                            </Link>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="bg-neutral-800 text-neutral-500 text-[10px] font-mono px-2 py-0.5 rounded">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-neutral-700 text-xs font-mono flex items-center gap-1">
                          <FiUser size={11} />
                          <span>{post.author}</span>
                        </div>
                        <div className="text-neutral-700 text-xs font-mono flex items-center gap-1">
                          <FiCalendar size={11} />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>

                      {/* 통계 + 읽기 시간 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-neutral-700 text-xs font-mono flex items-center gap-1">
                            <FiEye size={11} />
                            <span>{formatNumber(post.views)}</span>
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); handleLikePost(post._id) }}
                            className="text-neutral-700 text-xs font-mono flex items-center gap-1 hover:text-red-400 transition-colors"
                          >
                            <FiHeart size={11} />
                            <span>{formatNumber(post.likes)}</span>
                          </button>
                          <div className="text-neutral-700 text-xs font-mono flex items-center gap-1">
                            <FiMessageSquare size={11} />
                            <span>{formatNumber(post.comments.length)}</span>
                          </div>
                        </div>
                        <div className="text-neutral-700 text-xs font-mono flex items-center gap-1">
                          <FiClock size={11} />
                          <span>{locale === 'ko' ? `${calcReadingTime(post.content)}분` : `${calcReadingTime(post.content)}m`}</span>
                        </div>
                      </div>
                    </div>

                    {/* 읽기 버튼 */}
                    <div className="w-full text-center text-xs font-mono text-neutral-600 hover:text-neutral-300 border-t border-neutral-800 py-2.5 transition-colors">
                      {t.postsPage.readMore}
                    </div>
                  </Link>
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-neutral-700 font-mono text-sm text-center py-16">
            <FiMessageSquare size={48} className="mx-auto mb-4 opacity-40" />
            <p>{t.postsPage.noPosts}</p>
            <p className="mt-1 text-neutral-800">{t.postsPage.noPostsHint}</p>
          </div>
        )}

        {/* 무한 스크롤 sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {/* 로딩 스피너 */}
        {isFetchingMore && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-neutral-400 animate-spin" />
          </div>
        )}

        {/* 모든 포스트 로드 완료 메시지 */}
        {!hasMore && filteredPosts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-neutral-600 font-mono text-xs">모든 포스트를 불러왔습니다</p>
          </div>
        )}
      </div>

      {/* 게시글 작성/수정 폼 */}
      <CreatePostForm
        isOpen={showCreateForm}
        onClose={() => { setShowCreateForm(false); setEditingPost(null) }}
        onSuccess={handleCreateSuccess}
        editPost={editingPost}
      />
    </div>
  )
}
