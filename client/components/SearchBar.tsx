'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiFilter } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilterChange?: (filters: any) => void
  placeholder?: string
  filters?: {
    category?: string
    status?: string
    dateRange?: string
  }
  className?: string
}

export default function SearchBar({ 
  onSearch, 
  onFilterChange, 
  placeholder,
  filters = {},
  className = ""
}: SearchBarProps) {
  const { locale } = useLanguage()
  const resolvedPlaceholder = placeholder ?? (locale === 'en' ? 'Type to search...' : '검색어를 입력하세요...')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  const searchRef = useRef<HTMLDivElement>(null)

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

  // 외부 클릭 시 검색바 축소
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
        setShowFilters(false)
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
    <div ref={searchRef} className={`relative ${className}`}>
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? '100%' : 'auto' }}
        className="relative"
      >
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <FiSearch className="absolute left-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={resolvedPlaceholder}
              className="w-full pl-10 pr-12 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all duration-200"
            />
            
            <div className="absolute right-2 flex items-center gap-2">
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX size={18} />
                </motion.button>
              )}
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1 rounded transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'text-primary-600 bg-primary-100 dark:bg-primary-900/20'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <FiFilter size={18} />
              </button>
            </div>
          </div>
        </form>

        {/* 필터 패널 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{locale === 'en' ? 'Filters' : '필터'}</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {locale === 'en' ? 'Reset filters' : '필터 초기화'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 카테고리 필터 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {locale === 'en' ? 'Category' : '카테고리'}
                    </label>
                    <select
                      value={localFilters.category || 'all'}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                    >
                      <option value="all">{locale === 'en' ? 'All' : '전체'}</option>
                      <option value="web">{locale === 'en' ? 'Web' : '웹'}</option>
                      <option value="mobile">{locale === 'en' ? 'Mobile' : '모바일'}</option>
                      <option value="desktop">{locale === 'en' ? 'Desktop' : '데스크톱'}</option>
                      <option value="other">{locale === 'en' ? 'Other' : '기타'}</option>
                    </select>
                  </div>

                  {/* 상태 필터 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {locale === 'en' ? 'Status' : '상태'}
                    </label>
                    <select
                      value={localFilters.status || 'all'}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                    >
                      <option value="all">{locale === 'en' ? 'All' : '전체'}</option>
                      <option value="completed">{locale === 'en' ? 'Done' : '완료'}</option>
                      <option value="in-progress">{locale === 'en' ? 'In progress' : '진행중'}</option>
                      <option value="planned">{locale === 'en' ? 'Planned' : '계획'}</option>
                    </select>
                  </div>

                  {/* 날짜 범위 필터 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {locale === 'en' ? 'Date range' : '날짜 범위'}
                    </label>
                    <select
                      value={localFilters.dateRange || 'all'}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                    >
                      <option value="all">{locale === 'en' ? 'All time' : '전체 기간'}</option>
                      <option value="this-year">{locale === 'en' ? 'This year' : '올해'}</option>
                      <option value="last-year">{locale === 'en' ? 'Last year' : '작년'}</option>
                      <option value="this-month">{locale === 'en' ? 'This month' : '이번 달'}</option>
                      <option value="last-month">{locale === 'en' ? 'Last month' : '지난 달'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
