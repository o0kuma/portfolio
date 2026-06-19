'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FiArrowLeft, FiEye, FiHeart, FiMessageSquare, FiCalendar, FiUser, FiTag, FiEdit, FiTrash2, FiPlus, FiClock } from 'react-icons/fi'
import Link from 'next/link'
import BlogSearchBar from '../../components/BlogSearchBar'
import AdBanner from '../../components/AdBanner'
import CreatePostForm from '../../components/CreatePostForm'
import { normalizePostBoardItem } from '@/lib/postApi'
import Pagination from '@/components/ui/Pagination'
import { getApiBaseUrl } from '@/lib/api-base-url'
import { toast } from '@/lib/toast'
import { adminAuthHeaders } from '@/lib/admin-token'
import { hasAdminAccess } from '@/lib/admin-access'
import { useLanguage } from '@/lib/LanguageContext'
import { POST_CATEGORIES, getCategoryLabel } from '@/lib/post-categories'

const API_BASE_URL = getApiBaseUrl()

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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

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

  // API에서 포스트 데이터 가져오기
  const fetchPosts = async (page = 1, category = 'all', search = '') => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9'
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
        setPosts(mapped)
        setFilteredPosts(mapped)
        setTotalPages(Math.max(1, data.totalPages ?? 1))
      } else {
        console.error('Failed to fetch posts:', data.message)
        setPosts([])
        setFilteredPosts([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
      setFilteredPosts([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(currentPage, selectedCategory, searchQuery)
  }, [currentPage, selectedCategory, searchQuery])

  // 검색 및 필터링 로직
  useEffect(() => {
    let filtered = posts

    // 추가 필터들
    if (activeFilters.dateRange && activeFilters.dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(post => {
        const postDate = new Date(post.createdAt)
        switch (activeFilters.dateRange) {
          case 'this-year':
            return postDate.getFullYear() === now.getFullYear()
          case 'last-year':
            return postDate.getFullYear() === now.getFullYear() - 1
          case 'this-month':
            return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()
          case 'last-month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
            return postDate.getMonth() === lastMonth.getMonth() && postDate.getFullYear() === lastMonth.getFullYear()
          default:
            return true
        }
      })
    }

    setFilteredPosts(filtered)
  }, [posts, activeFilters])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery((prev) => {
      if (prev !== query) {
        setCurrentPage(1)
      }
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
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
        // 삭제 성공 시 목록 새로고침
        fetchPosts(currentPage, selectedCategory, searchQuery)
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
        method: 'POST'
      })

      if (response.ok) {
        // 좋아요 성공 시 목록 새로고침
        fetchPosts(currentPage, selectedCategory, searchQuery)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleCreateSuccess = () => {
    fetchPosts(currentPage, selectedCategory, searchQuery)
    setEditingPost(null)
  }

  const isInitialLoad = isLoading && posts.length === 0

  if (isInitialLoad) {
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
                {t.postsPage.loading}
              </h3>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-textPrimary">
      <header className="sticky top-0 z-40 glass-panel border-b border-border shadow-lg">
        <div className="page-shell py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 border border-white/30 dark:border-slate-700/30"
              >
                <FiArrowLeft size={20} />
                <span className="font-medium">{t.postsPage.home}</span>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                {t.postsPage.title}
              </h1>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl hover:brightness-105"
              >
                <FiPlus size={20} />
                <span>{t.postsPage.newPost}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="page-shell relative z-10 py-12">
        <div className="relative z-[100] mb-10">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl shadow-purple-500/10 dark:shadow-purple-900/20 overflow-visible">
              <BlogSearchBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                placeholder={t.postsPage.searchPlaceholder}
                filters={activeFilters}
                className="max-w-4xl mx-auto"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-12 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.id)}
              className={`rounded-full px-6 py-3 font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl'
                  : 'glass-panel text-textPrimary hover:border-primary-500/40'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {searchQuery && (
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-full border border-white/30 dark:border-slate-700/30 shadow-lg">
              <p className="text-gray-600 dark:text-gray-400">
                "<span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{searchQuery}</span>" search results: 
                <span className="font-semibold text-gray-800 dark:text-white ml-2">{filteredPosts.length}</span>
              </p>
            </div>
          </div>
        )}

        {/* 포스트 그리드 */}
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
                <div className="relative group transition-transform duration-300 hover:-translate-y-1">
                {/* 그라데이션 테두리 효과 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition duration-700"></div>
                <Link
                  href={`/posts/${post._id}`}
                  className="relative glass-panel rounded-3xl overflow-hidden border border-border shadow-xl transition-all duration-500 group-hover:border-primary-500/40 block"
                >
                {/* 포스트 헤더 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {post.featured && (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full font-semibold shadow-lg">
                          ⭐ Featured
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.category === 'tech' ? 'bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 backdrop-blur-sm' :
                        post.category === 'economy' ? 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 backdrop-blur-sm' :
                        post.category === 'coin' ? 'bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 backdrop-blur-sm' :
                        post.category === 'travel' ? 'bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-400 backdrop-blur-sm' :
                        post.category === 'food' ? 'bg-orange-100/80 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 backdrop-blur-sm' :
                        post.category === 'lottery' ? 'bg-pink-100/80 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 backdrop-blur-sm' :
                        'bg-gray-100/80 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 backdrop-blur-sm'
                      }`}>
                        {getCategoryLabel(post.category, locale)}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center space-x-2" onClick={(e) => e.preventDefault()}>
                        <button
                          onClick={(e) => { e.preventDefault(); handleEditPost(post) }}
                          className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                          title="수정"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); handleDeletePost(post._id) }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="삭제"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* 태그 chips (first 2) */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full flex items-center gap-1 font-medium"
                        >
                          <FiTag size={11} />
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <FiUser size={14} />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar size={14} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* 통계 + 읽기 시간 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FiEye size={14} />
                        <span>{formatNumber(post.views)}</span>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); handleLikePost(post._id) }}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      >
                        <FiHeart size={14} />
                        <span>{formatNumber(post.likes)}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <FiMessageSquare size={14} />
                        <span>{formatNumber(post.comments.length)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <FiClock size={12} />
                      <span>{locale === 'ko' ? `${calcReadingTime(post.content)}분 읽기` : `${calcReadingTime(post.content)} min read`}</span>
                    </div>
                  </div>
                </div>

                {/* 읽기 버튼 */}
                <div className="px-6 pb-6">
                  <span
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {t.postsPage.readMore}
                    <FiArrowLeft size={16} className="rotate-180" />
                  </span>
                </div>
                </Link>
              </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FiMessageSquare size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {t.postsPage.noPosts}
            </h3>
            <p className="text-textMuted">
              {t.postsPage.noPostsHint}
            </p>
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="flex justify-center mt-8">
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
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
