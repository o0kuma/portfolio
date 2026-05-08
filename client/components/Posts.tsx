'use client'

import { useState, useEffect } from 'react'
import { FiEye, FiHeart, FiMessageSquare, FiCalendar, FiUser, FiTag, FiFileText, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import SearchBar from './SearchBar'
import PostForm from './PostForm'
import Link from 'next/link'
import { getApiBaseUrl } from '@/lib/api-base-url'

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
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'general', name: '일반' },
    { id: 'tech', name: '기술' },
    { id: 'project', name: '프로젝트' },
    { id: 'update', name: '업데이트' }
  ]

  // API에서 포스트 데이터 가져오기
  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '8'
      })
      
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`${API_BASE_URL}/api/posts?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setPosts(data.posts)
        setFilteredPosts(data.posts)
      } else {
        console.error('Failed to fetch posts:', data.message)
        // 에러 시 빈 배열로 설정
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
    fetchPosts()
  }, [selectedCategory, searchQuery])

  // 검색 및 필터링 로직
  useEffect(() => {
    let filtered = posts

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

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
  }, [posts, selectedCategory, searchQuery, activeFilters])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters)
  }

  const handleSavePost = async (postData: any) => {
    try {
      const url = postData._id ? `${API_BASE_URL}/api/posts/${postData._id}` : `${API_BASE_URL}/api/posts`
      const method = postData._id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
      
      if (response.ok) {
        // 저장 성공 시 목록 새로고침
        fetchPosts()
        setShowCreateForm(false)
        setEditingPost(null)
      } else {
        const data = await response.json()
        alert('저장 실패: ' + data.message)
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 삭제 성공 시 목록 새로고침
        fetchPosts()
      } else {
        const data = await response.json()
        alert('삭제 실패: ' + data.message)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        // 좋아요 성공 시 목록 새로고침
        fetchPosts()
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
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

  if (isLoading) {
    return (
      <section id="posts" className="section-padding bg-canvas">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 border-r-primary-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                게시글을 불러오는 중...
              </h3>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="posts" className="section-padding bg-canvas">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">게시판</span>에서 정보를 공유합니다
          </h2>
          <p className="text-lg text-textMuted max-w-2xl mx-auto">
            개발 과정에서 배운 점들과 새로운 기술에 대한 정보를 공유합니다.
            함께 성장하고 지식을 나누는 공간입니다.
          </p>
        </div>

        <div className="mb-12">
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            placeholder="게시글을 검색하세요..."
            filters={activeFilters}
            className="max-w-4xl mx-auto"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {searchQuery && (
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              "<span className="font-semibold text-primary-600 dark:text-primary-400">{searchQuery}</span>" 검색 결과: 
              <span className="font-semibold text-gray-800 dark:text-white ml-2">{filteredPosts.length}</span>개
            </p>
          </div>
        )}

        {/* 포스트 그리드 */}
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <div key={post._id} className="card overflow-hidden group hover:shadow-xl transition-all duration-300">
                {/* 포스트 헤더 */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {post.featured && (
                      <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full font-medium">
                        Featured
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="수정"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="삭제"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 읽기 버튼 */}
                <div className="px-6 pb-6">
                  <Link
                    href={`/posts/${post._id}`}
                    className="w-full btn-outline py-2 text-sm group-hover:bg-primary-600 group-hover:text-white transition-all duration-200 inline-block text-center"
                  >
                    자세히 읽기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FiFileText size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              게시글을 찾을 수 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-600">
              검색어나 필터를 변경해보세요.
            </p>
          </div>
        )}

        <div className="text-center mt-16 space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <FiPlus size={20} />
              <span>새 글 작성</span>
            </button>
            <Link
              href="/posts"
              className="btn-outline inline-flex items-center space-x-2"
            >
              <span>전체 게시판 보기</span>
              <FiMessageSquare size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* PostForm 모달 */}
      <PostForm
        isOpen={showCreateForm || !!editingPost}
        onClose={() => {
          setShowCreateForm(false)
          setEditingPost(null)
        }}
        post={editingPost}
        onSave={handleSavePost}
      />
    </section>
  )
}
