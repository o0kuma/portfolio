'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiX, FiFileText, FiLayout, FiZap } from 'react-icons/fi'
import { getCategoryLabel } from '@/lib/post-categories'

interface SearchPost {
  id: string
  _id?: string
  title: string
  category: string
  created_at?: string
  createdAt?: string
}

interface StaticItem {
  title: string
  url: string
  type: 'page' | 'game'
  desc: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const STATIC_PAGES: StaticItem[] = [
  { title: '3D 갤러리', url: '/gallery', type: 'page', desc: '프로젝트 3D 갤러리' },
  { title: '방명록', url: '/guestbook', type: 'page', desc: '방문자 방명록' },
  { title: '푸드맵', url: '/food', type: 'page', desc: '맛집 지도' },
  { title: '코드 스니펫', url: '/snippets', type: 'page', desc: '코드 스니펫 모음' },
  { title: 'Tower Defense', url: '/tower-defense', type: 'game', desc: '전략 타워 디펜스 게임' },
  { title: 'Survive', url: '/survive', type: 'game', desc: '탑다운 슈터 게임' },
  { title: 'Typing Game', url: '/typing-game', type: 'game', desc: '타이핑 속도 측정' },
  { title: 'Tetris', url: '/tetris', type: 'game', desc: '클래식 테트리스' },
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [staticResults, setStaticResults] = useState<StaticItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Autofocus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setPosts([])
      setStaticResults([])
    }
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setPosts([])
      setStaticResults([])
      return
    }

    // Filter static pages/games (2글자 이상)
    if (trimmed.length >= 2) {
      const lower = trimmed.toLowerCase()
      const filtered = STATIC_PAGES.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.desc.toLowerCase().includes(lower),
      )
      setStaticResults(filtered)
    } else {
      setStaticResults([])
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/posts?q=${encodeURIComponent(q)}&limit=10`)
      const data = await res.json()
      setPosts(Array.isArray(data.posts) ? data.posts : [])
    } catch {
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelectPost = (post: SearchPost) => {
    const id = post._id ?? post.id
    router.push(`/posts/${id}`)
    onClose()
  }

  const handleSelectStatic = (item: StaticItem) => {
    router.push(item.url)
    onClose()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const hasResults = posts.length > 0 || staticResults.length > 0
  const staticPages = staticResults.filter((i) => i.type === 'page')
  const staticGames = staticResults.filter((i) => i.type === 'game')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800">
          <FiSearch size={20} className="text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="검색어를 입력하세요"
            className="flex-1 bg-transparent text-neutral-100 text-lg placeholder:text-neutral-600 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setPosts([]); setStaticResults([]) }}
              className="text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <FiX size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-400 transition-colors ml-1"
            aria-label="닫기"
          >
            <span className="text-xs font-mono border border-neutral-700 rounded px-1.5 py-0.5">ESC</span>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() && (
            <div className="py-12 text-center text-neutral-600 font-mono text-sm">
              검색어를 입력하세요
            </div>
          )}

          {query.trim() && isLoading && (
            <div className="py-12 text-center text-neutral-600 font-mono text-sm">
              검색 중...
            </div>
          )}

          {query.trim() && !isLoading && !hasResults && (
            <div className="py-12 text-center text-neutral-600 font-mono text-sm">
              검색 결과가 없습니다
            </div>
          )}

          {!isLoading && hasResults && (
            <div>
              {/* 포스트 섹션 */}
              {posts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 px-5 py-2 border-b border-neutral-800/60">
                    <FiFileText size={12} className="text-neutral-600" />
                    <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">포스트</span>
                  </div>
                  <ul>
                    {posts.map((post) => {
                      const id = post._id ?? post.id
                      const date = post.createdAt ?? post.created_at
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => handleSelectPost(post)}
                            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-900 transition-colors text-left group"
                          >
                            <FiSearch size={14} className="text-neutral-700 group-hover:text-cyan-400 shrink-0 transition-colors" />
                            <div className="flex-1 min-w-0">
                              <p className="text-neutral-100 font-medium text-sm truncate group-hover:text-white transition-colors">
                                {post.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                {getCategoryLabel(post.category, 'ko')}
                              </span>
                              {date && (
                                <span className="text-[11px] font-mono text-neutral-600">
                                  {formatDate(date)}
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}

              {/* 페이지 섹션 */}
              {staticPages.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 px-5 py-2 border-b border-neutral-800/60">
                    <FiLayout size={12} className="text-neutral-600" />
                    <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">페이지</span>
                  </div>
                  <ul>
                    {staticPages.map((item) => (
                      <li key={item.url}>
                        <button
                          type="button"
                          onClick={() => handleSelectStatic(item)}
                          className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-900 transition-colors text-left group"
                        >
                          <FiLayout size={14} className="text-neutral-700 group-hover:text-violet-400 shrink-0 transition-colors" />
                          <div className="flex-1 min-w-0">
                            <p className="text-neutral-100 font-medium text-sm truncate group-hover:text-white transition-colors">
                              {item.title}
                            </p>
                            <p className="text-neutral-600 text-xs font-mono truncate">{item.desc}</p>
                          </div>
                          <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                            page
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 게임 섹션 */}
              {staticGames.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 px-5 py-2 border-b border-neutral-800/60">
                    <FiZap size={12} className="text-neutral-600" />
                    <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">게임</span>
                  </div>
                  <ul>
                    {staticGames.map((item) => (
                      <li key={item.url}>
                        <button
                          type="button"
                          onClick={() => handleSelectStatic(item)}
                          className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-900 transition-colors text-left group"
                        >
                          <FiZap size={14} className="text-neutral-700 group-hover:text-yellow-400 shrink-0 transition-colors" />
                          <div className="flex-1 min-w-0">
                            <p className="text-neutral-100 font-medium text-sm truncate group-hover:text-white transition-colors">
                              {item.title}
                            </p>
                            <p className="text-neutral-600 text-xs font-mono truncate">{item.desc}</p>
                          </div>
                          <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                            game
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
