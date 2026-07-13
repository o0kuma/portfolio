'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiFilter } from 'react-icons/fi'

interface BlogSearchBarProps {
  onSearch: (query: string) => void
  onFilterChange?: (filters: any) => void
  placeholder?: string
  filters?: {
    dateRange?: string
  }
  className?: string
}

export default function BlogSearchBar({ 
  onSearch, 
  onFilterChange, 
  placeholder = "Search posts...",
  filters = {},
  className = ""
}: BlogSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        onSearch(searchQuery.trim())
      } else {
        onSearch('')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  // 필터 변경 시 콜백 호출
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(localFilters)
    }
  }, [localFilters, onFilterChange])

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setMounted(true)
  }, [])

  // 필터 패널 위치 계산 및 업데이트
  useEffect(() => {
    if (!showFilters || !searchRef.current || !filterRef.current) return

    const updatePosition = () => {
      const searchRect = searchRef.current!.getBoundingClientRect()
      const filterPanel = filterRef.current!
      filterPanel.style.position = 'fixed'
      filterPanel.style.top = `${searchRect.bottom + 12}px`
      filterPanel.style.left = `${searchRect.left}px`
      filterPanel.style.width = `${searchRect.width}px`
      filterPanel.style.maxHeight = `${window.innerHeight - searchRect.bottom - 24}px`
      filterPanel.style.overflowY = 'auto'
    }

    updatePosition()
    
    // 스크롤 및 리사이즈 시 위치 업데이트
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [showFilters])

  // 외부 클릭 시 검색바 축소
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
          setIsExpanded(false)
          setShowFilters(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    onSearch('')
  }

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const clearFilters = () => {
    setLocalFilters({})
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  const hasActiveFilters = Object.values(localFilters).some(value => value && value !== 'all')

  return (
    <div ref={searchRef} className={`relative z-[100] ${className}`}>
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? '100%' : 'auto' }}
        className="relative overflow-visible"
      >
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <FiSearch className="absolute left-4 text-gray-400 dark:text-gray-500 z-10" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={placeholder}
              className="w-full pl-12 pr-14 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-700 dark:text-gray-300 relative z-10"
            />
            
            <div className="absolute right-3 flex items-center gap-2 z-20">
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search"
                  className="flex h-10 w-10 items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
                >
                  <FiX size={18} />
                </motion.button>
              )}

              <motion.button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Toggle filters"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                  showFilters || hasActiveFilters
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10'
                }`}
              >
                <FiFilter size={18} />
              </motion.button>
            </div>
          </div>
        </form>

        {/* 필터 패널 - 글래스모피즘 */}
        {mounted && (
          <AnimatePresence>
            {showFilters && createPortal(
              <motion.div
                ref={filterRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-white/40 dark:border-slate-700/40 rounded-2xl shadow-2xl shadow-purple-500/20 dark:shadow-purple-900/30 z-[9999] overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* 날짜 범위 필터 */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Date Range
                      </label>
                      <select
                        value={localFilters.dateRange || 'all'}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl border border-white/30 dark:border-slate-600/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-all duration-300"
                      >
                        <option value="all">All Time</option>
                        <option value="this-year">This Year</option>
                        <option value="last-year">Last Year</option>
                        <option value="this-month">This Month</option>
                        <option value="last-month">Last Month</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>,
              document.body
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  )
}

