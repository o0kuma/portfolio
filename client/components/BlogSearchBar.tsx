'use client'

import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiX, FiFilter } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'

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
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [searchQuery, setSearchQuery] = useState('')
  const [, setIsExpanded] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
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

  const dateOptions = [
    { value: 'all', ko: '전체 기간', en: 'All time' },
    { value: 'this-year', ko: '올해', en: 'This year' },
    { value: 'last-year', ko: '작년', en: 'Last year' },
    { value: 'this-month', ko: '이번 달', en: 'This month' },
    { value: 'last-month', ko: '지난달', en: 'Last month' },
  ]

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative flex items-center">
        <FiSearch className="pointer-events-none absolute left-4 text-ink" size={18} aria-hidden />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-[52px] w-full rounded-xl border-2 border-ink bg-white pl-11 pr-24 text-base text-ink shadow-ink-sm placeholder:text-ink-soft focus:outline-none"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={en ? 'Clear search' : '검색어 지우기'}
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:text-ink"
            >
              <FiX size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-label={en ? 'Filters' : '필터'}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
              showFilters || hasActiveFilters ? 'text-pen' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <FiFilter size={16} />
          </button>
        </div>
      </form>

      {showFilters && (
        <div ref={filterRef} className="absolute left-0 right-0 top-full z-30 mt-3 rounded-xl border-2 border-ink bg-white p-4 shadow-ink-sm">
          <div className="flex items-center justify-between">
            <label htmlFor="blog-date-range" className="text-xs text-fg-subtle">
              {en ? 'Date range' : '기간'}
            </label>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="text-xs text-fg-muted hover:text-fg">
                {en ? 'Reset' : '초기화'}
              </button>
            )}
          </div>
          <select
            id="blog-date-range"
            value={localFilters.dateRange || 'all'}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="mt-2 h-10 w-full rounded-lg border-2 border-ink bg-paper px-3 text-sm text-ink focus:outline-none"
          >
            {dateOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {en ? o.en : o.ko}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
