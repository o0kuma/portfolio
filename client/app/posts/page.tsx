'use client'

import React, { useState, useEffect } from 'react'
import { FiArrowLeft, FiEye, FiHeart, FiMessageSquare, FiCalendar, FiUser, FiTag, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'
import Link from 'next/link'
import BlogSearchBar from '../../components/BlogSearchBar'
import AdBanner from '../../components/AdBanner'
import CreatePostForm from '../../components/CreatePostForm'
import { normalizePostBoardItem } from '@/lib/postApi'
import { getApiBaseUrl } from '@/lib/api-base-url'
import { toast } from '@/lib/toast'

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
    { id: 'all', name: 'All' },
    { id: 'tech', name: 'Tech' },
    { id: 'economy', name: 'Economy' },
    { id: 'coin', name: 'Coin' },
    { id: 'travel', name: 'Travel' },
    { id: 'food', name: 'Food' },
    { id: 'lottery', name: 'Lottery' }
  ]

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
        const mapped = (data.posts as Record<string, unknown>[]).map((row) =>
          normalizePostBoardItem(row),
        )
        setPosts(mapped)
        setFilteredPosts(mapped)
        setTotalPages(data.totalPages)
      } else {
        console.error('Failed to fetch posts:', data.message)
        // 에러 시 샘플 데이터 사용
        setPosts([])
        setFilteredPosts([])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
      setFilteredPosts([])
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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters)
  }

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

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setShowCreateForm(true)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return

    const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN
    const headers: Record<string, string> = {}
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers
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
                Loading posts...
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
                <span className="font-medium">Home</span>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Posts
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl hover:brightness-105"
            >
              <FiPlus size={20} />
              <span>New Post</span>
            </button>
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
                placeholder="Search posts..."
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
                <div className="relative glass-panel rounded-3xl overflow-hidden border border-border shadow-xl transition-all duration-500 group-hover:border-primary-500/40">
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
                        {post.category === 'tech' ? 'Tech' :
                         post.category === 'economy' ? 'Economy' :
                         post.category === 'coin' ? 'Coin' :
                         post.category === 'travel' ? 'Travel' :
                         post.category === 'food' ? 'Food' :
                         post.category === 'lottery' ? 'Lottery' :
                         'General'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="수정"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="삭제"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 text-xs rounded-md flex items-center gap-1"
                      >
                        <FiTag size={12} />
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>

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

                  {/* 통계 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FiEye size={14} />
                        <span>{formatNumber(post.views)}</span>
                      </div>
                      <button
                        onClick={() => handleLikePost(post._id)}
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
                  </div>
                </div>

                {/* 읽기 버튼 */}
                <div className="px-6 pb-6">
                  <Link
                    href={`/posts/${post._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Read More
                    <FiArrowLeft size={16} className="rotate-180" />
                  </Link>
                </div>
                </div>
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
              No posts found
            </h3>
            <p className="text-textMuted">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-textPrimary shadow-lg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surfaceElevated/80"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`rounded-xl px-5 py-2.5 font-semibold transition ${
                  currentPage === page
                    ? 'scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl'
                    : 'glass-panel text-textPrimary hover:border-primary-500/40'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-textPrimary shadow-lg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surfaceElevated/80"
            >
              Next
            </button>
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
