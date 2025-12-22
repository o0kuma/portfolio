'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiCalendar, FiUser, FiTag, FiEye, FiHeart, FiMessageSquare, FiSearch, FiSun, FiMoon, FiArrowUp, FiStar, FiZap } from 'react-icons/fi'
import Link from 'next/link'
import BlogSearchBar from '../components/BlogSearchBar'
import BlogFooter from '../components/BlogFooter'
import AIMessenger from '../components/AIMessenger'
import AdBanner from '../components/AdBanner'

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

export default function BlogPageClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAIMessengerOpen, setIsAIMessengerOpen] = useState(false)

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'tech', name: 'Tech' },
    { id: 'economy', name: 'Economy' },
    { id: 'coin', name: 'Coin' },
    { id: 'travel', name: 'Travel' },
    { id: 'food', name: 'Food' },
    { id: 'lottery', name: 'Lottery' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // API에서 포스트 데이터 가져오기
  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '12'
      })
      
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`http://localhost:5000/api/posts?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setPosts(data.posts)
        setFilteredPosts(data.posts)
      } else {
        console.error('Failed to fetch posts:', data.message)
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
  }

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
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

  // Featured 포스트와 일반 포스트 분리
  const featuredPosts = filteredPosts.filter(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 via-blue-950 to-slate-950 dark:from-slate-950 dark:via-purple-950 dark:via-indigo-950 dark:to-slate-950 relative overflow-hidden">
      {/* 강렬한 배경 애니메이션 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/40 to-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 150, 0],
            y: [0, 150, -150, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/40 to-cyan-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, -80, 0],
            y: [0, -80, 80, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-pink-500/35 to-orange-500/25 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -120, 120, 0],
            y: [0, 120, -120, 0],
            scale: [1, 0.8, 1.2, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-br from-indigo-500/30 to-purple-500/25 rounded-full blur-3xl"
        />
      </div>
      
      {/* 그리드 패턴 오버레이 */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* 헤더 - 글래스모피즘 */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-purple-500/10 dark:shadow-purple-900/20 border-b border-white/20 dark:border-slate-700/30'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer flex items-center gap-2"
              >
                <FiStar className="text-purple-500" />
                <span>iykyk blog</span>
              </motion.div>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/posts" 
                className="relative text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 group"
              >
                Posts
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/portfolio" 
                className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
              >
                Portfolio
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAIMessengerOpen(!isAIMessengerOpen)}
                className="relative text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
              >
                <FiZap size={18} />
                <span>AI Chat</span>
              </motion.button>
            </nav>

            {/* 우측 버튼들 */}
            <div className="flex items-center space-x-4">
              {/* 다크모드 토글 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 히어로 섹션 */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* 배지 - 글래스모피즘 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-full border border-purple-200/50 dark:border-purple-700/30 shadow-lg shadow-purple-500/10 dark:shadow-purple-900/20"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <FiArrowUp className="text-purple-600 dark:text-purple-400" />
              </motion.div>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Exploring diverse topics</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-black mb-8 leading-[0.9]"
            >
              <span 
                className="relative inline-block bg-gradient-to-r from-purple-500 via-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent"
                style={{
                  backgroundSize: '200% auto',
                  animation: 'gradient 3s ease infinite',
                  filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.6))',
                  WebkitTextStroke: '2px transparent'
                }}
              >
                iykyk
              </span>
              <br />
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative inline-block bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent text-6xl md:text-7xl lg:text-8xl"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))'
                }}
              >
                blog
              </motion.span>
              <motion.span
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="inline-block ml-4 text-6xl md:text-7xl lg:text-8xl"
              >
                ⚡
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-16 leading-relaxed"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                A space for sharing thoughts, experiences, and insights
              </span>
              <br className="hidden md:block" />
              <span className="text-gray-700 dark:text-gray-200 text-xl md:text-2xl lg:text-3xl">
                across various topics and interests.
              </span>
            </motion.p>
            
            {/* 검색바 - 글래스모피즘 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto relative z-30 mb-8"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl shadow-purple-500/10 dark:shadow-purple-900/20 overflow-visible">
                  <BlogSearchBar
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    placeholder="Search posts..."
                    filters={activeFilters}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <div className="container-custom py-12 relative z-10">
        {/* 카테고리 필터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-16 relative z-10"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 relative overflow-hidden ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-105'
                  : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-slate-800/90 border border-white/30 dark:border-slate-700/30 hover:border-purple-300/50 dark:hover:border-purple-700/50 shadow-lg shadow-purple-500/5 dark:shadow-purple-900/10'
              }`}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Featured 포스트 */}
        {featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Featured Posts
              </h2>
              <div className="h-1 flex-1 bg-gradient-to-r from-pink-600 to-transparent rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  {/* 그라데이션 테두리 효과 */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition duration-700"></div>
                  <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-slate-700/30 group-hover:border-purple-300/50 dark:group-hover:border-purple-700/50">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full font-semibold shadow-lg">
                          ⭐ Featured
                        </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.category === 'tech' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        post.category === 'economy' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        post.category === 'coin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' :
                        post.category === 'travel' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        post.category === 'food' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        post.category === 'lottery' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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

                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {post.content}
                    </p>

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
                    </div>

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

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FiEye size={14} />
                          <span>{formatNumber(post.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiHeart size={14} />
                          <span>{formatNumber(post.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiMessageSquare size={14} />
                          <span>{formatNumber(post.comments.length)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                      <div className="px-6 pb-6">
                        <Link
                          href={`/posts/${post._id}`}
                          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          Read More
                          <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        {/* 최신 포스트 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Latest Posts
              </h2>
              <div className="h-1 flex-1 bg-gradient-to-r from-purple-600 to-transparent rounded-full"></div>
            </div>
            <Link
              href="/posts"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              View All
              <FiArrowRight size={18} />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 border-r-primary-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Loading posts...
              </h3>
            </div>
          ) : regularPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
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
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  {/* 그라데이션 테두리 효과 */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition duration-700"></div>
                  <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-slate-700/30 group-hover:border-blue-300/50 dark:group-hover:border-blue-700/50">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.category === 'tech' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        post.category === 'economy' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        post.category === 'coin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' :
                        post.category === 'travel' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        post.category === 'food' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        post.category === 'lottery' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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

                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {post.content}
                    </p>

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

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FiEye size={14} />
                          <span>{formatNumber(post.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiHeart size={14} />
                          <span>{formatNumber(post.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiMessageSquare size={14} />
                          <span>{formatNumber(post.comments.length)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                      <div className="px-6 pb-6">
                        <Link
                          href={`/posts/${post._id}`}
                          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          Read More
                          <FiArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              ))}
              </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <FiMessageSquare size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500 dark:text-gray-600">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <BlogFooter />

      {/* AI 챗봇 */}
      <AIMessenger
        isOpen={isAIMessengerOpen}
        onClose={() => setIsAIMessengerOpen(false)}
        context="blog"
      />
    </div>
  )
}

