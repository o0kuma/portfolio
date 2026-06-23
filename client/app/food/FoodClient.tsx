'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { RestaurantPage, RestaurantItem } from '@/lib/notion'

type RegionWithItems = RestaurantPage & { items: RestaurantItem[] }

const CATEGORY_COLOR: Record<string, string> = {
  '한식': 'text-orange-400 border-orange-400/30 bg-orange-400/5',
  '일식': 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  '양식': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  '중식': 'text-red-400 border-red-400/30 bg-red-400/5',
  '라멘': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  '베트남 음식': 'text-green-400 border-green-400/30 bg-green-400/5',
  '이탈리안': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  '돈까스': 'text-amber-400 border-amber-400/30 bg-amber-400/5',
  '샐러드': 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLOR[category] ?? 'text-neutral-400 border-neutral-700 bg-neutral-800/50'
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cls} shrink-0`}>
      {category}
    </span>
  )
}

function MapPinIcon({ size = 13 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function GoogleMapEmbed({ item }: { item: RestaurantItem }) {
  const query = item.address
    ? `${item.name} ${item.address}`
    : item.name

  if (!MAPS_KEY) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-600 font-mono text-xs">
        NEXT_PUBLIC_GOOGLE_MAPS_KEY 미설정
      </div>
    )
  }

  const src = `https://www.google.com/maps/embed/v1/search?key=${MAPS_KEY}&q=${encodeURIComponent(query)}&language=ko`

  return (
    <iframe
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="rounded-xl"
    />
  )
}

function RestaurantCard({
  item,
  index,
  selected,
  onSelect,
}: {
  item: RestaurantItem
  index: number
  selected: boolean
  onSelect: (item: RestaurantItem) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.025 }}
      onClick={() => onSelect(item)}
      className={`group rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        selected
          ? 'border-emerald-500/50 bg-emerald-950/30 ring-1 ring-emerald-500/20'
          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800/80'
      }`}
    >
      {item.imageUrl && (
        <div className="relative h-32 w-full">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-neutral-100 text-sm leading-snug">{item.name}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.checked && (
            <span className="text-[10px] font-mono text-cyan-400 border border-cyan-400/30 bg-cyan-400/5 px-1.5 py-0.5 rounded">
              방문
            </span>
          )}
          {item.category && <CategoryBadge category={item.category} />}
          <span
            className={`flex items-center justify-center transition-colors duration-150 p-0.5 ${
              selected ? 'text-emerald-400' : 'text-neutral-600 group-hover:text-emerald-400'
            }`}
          >
            <MapPinIcon />
          </span>
        </div>
      </div>

      {item.menu && (
        <p className="text-xs text-neutral-400 leading-relaxed mb-2 line-clamp-2">
          {item.menu}
        </p>
      )}

      {item.address && (
        <p className="text-[11px] text-neutral-600 truncate mt-auto">
          📍 {item.address}
        </p>
      )}
      </div>
    </motion.div>
  )
}

export default function FoodClient({
  regions,
  error,
  errorMessage,
}: {
  regions: RegionWithItems[]
  error?: boolean
  errorMessage?: string
}) {
  const [activeRegion, setActiveRegion] = useState<string>(regions[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [visitedOnly, setVisitedOnly] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RestaurantItem | null>(null)

  const current = regions.find((r) => r.id === activeRegion) ?? regions[0]

  const categories = useMemo(() => {
    if (!current) return []
    const cats = current.items
      .map((item) => item.category)
      .filter((c): c is string => Boolean(c))
    return Array.from(new Set(cats))
  }, [current])

  const filteredItems = useMemo(() => {
    if (!current) return []
    return current.items.filter((item) => {
      const matchSearch = search.trim() === '' || item.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = activeCategory === null || item.category === activeCategory
      const matchVisited = !visitedOnly || item.checked
      return matchSearch && matchCategory && matchVisited
    })
  }, [current, search, activeCategory, visitedOnly])

  function handleRegionChange(id: string) {
    setActiveRegion(id)
    setSearch('')
    setActiveCategory(null)
    setVisitedOnly(false)
    setSelectedItem(null)
  }

  function handleSelectItem(item: RestaurantItem) {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item))
  }

  const googleMapsUrl = selectedItem
    ? `https://www.google.com/maps/search/${encodeURIComponent(
        selectedItem.address ? `${selectedItem.name} ${selectedItem.address}` : selectedItem.name
      )}`
    : ''

  const regionMapUrl = current
    ? `https://www.google.com/maps/search/${encodeURIComponent(current.title + ' 맛집')}`
    : ''

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-800 py-12">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-neutral-700" />
            <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase">Food</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-50">
            맛집 리스트
            <span className="block text-neutral-500 text-xl md:text-2xl font-medium mt-2">
              Restaurant List
            </span>
          </h1>
        </div>
      </div>

      <div className="container-custom py-10">
        {error && (
          <div className="py-20 text-center space-y-2">
            <p className="text-neutral-500 font-mono text-sm">노션 데이터를 불러오지 못했습니다.</p>
            {errorMessage && <p className="text-red-400 font-mono text-xs">{errorMessage}</p>}
          </div>
        )}

        {!error && regions.length === 0 && (
          <p className="text-neutral-500 font-mono text-sm py-20 text-center">등록된 맛집이 없습니다.</p>
        )}

        {!error && regions.length > 0 && (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar — vertical on md+, horizontal scrollable pills on mobile */}
            <aside className="md:w-52 shrink-0">
              {/* Mobile: horizontal scrollable pill bar */}
              <div className="flex overflow-x-auto gap-2 pb-2 md:hidden scrollbar-none">
                {regions.map((region) => {
                  const isActive = activeRegion === region.id
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => handleRegionChange(region.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150 ${
                        isActive
                          ? 'bg-neutral-800 text-neutral-100 border-neutral-700'
                          : 'text-neutral-500 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-900/60'
                      }`}
                    >
                      {region.emoji && <span>{region.emoji}</span>}
                      <span>{region.title}</span>
                      <span className={`text-[10px] font-mono tabular-nums ${isActive ? 'text-neutral-400' : 'text-neutral-700'}`}>
                        {region.items.length}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Desktop: vertical sidebar */}
              <div className="hidden md:block sticky top-24 space-y-0.5">
                <p className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase px-3 pb-2">
                  지역
                </p>
                {regions.map((region) => {
                  const isActive = activeRegion === region.id
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => handleRegionChange(region.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                          : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900/60 border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {region.emoji && <span>{region.emoji}</span>}
                        <span className="truncate">{region.title}</span>
                      </span>
                      <span className={`text-[10px] font-mono shrink-0 tabular-nums ${isActive ? 'text-neutral-400' : 'text-neutral-700'}`}>
                        {region.items.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {current && (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Region header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
                        {current.emoji && <span>{current.emoji}</span>}
                        <span>{current.title}</span>
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-neutral-600">
                          총 {current.items.length}곳
                        </span>
                        <a
                          href={regionMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 border border-neutral-700 hover:text-emerald-400 hover:border-emerald-400/50 px-2.5 py-1 rounded-full transition-all duration-150"
                        >
                          <MapPinIcon />
                          <span>전체 지도 보기</span>
                          <ExternalLinkIcon />
                        </a>
                      </div>
                    </div>

                    {/* Google Map embed panel */}
                    <AnimatePresence>
                      {selectedItem && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 360 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="mb-5 overflow-hidden rounded-xl border border-emerald-500/30 bg-neutral-900"
                        >
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800">
                            <div className="flex items-center gap-2 text-sm text-neutral-300">
                              <MapPinIcon size={14} />
                              <span className="font-semibold">{selectedItem.name}</span>
                              {selectedItem.address && (
                                <span className="text-neutral-600 text-xs truncate max-w-[200px]">
                                  {selectedItem.address}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-emerald-400 transition-colors"
                              >
                                구글맵에서 열기
                                <ExternalLinkIcon />
                              </a>
                              <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="text-neutral-600 hover:text-neutral-300 transition-colors p-0.5"
                              >
                                <XIcon />
                              </button>
                            </div>
                          </div>
                          <div className="h-[312px]">
                            <GoogleMapEmbed item={selectedItem} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Search input */}
                    <div className="mb-4">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="식당 이름 검색..."
                        className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-sm rounded-lg px-4 py-2.5 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                      />
                    </div>

                    {/* Category filter pills + visited toggle */}
                    {categories.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-6">
                        <button
                          type="button"
                          onClick={() => setActiveCategory(null)}
                          className={`text-[11px] font-mono px-3 py-1 rounded-full border transition-all duration-150 ${
                            activeCategory === null
                              ? 'bg-neutral-200 text-neutral-900 border-neutral-200'
                              : 'text-neutral-500 border-neutral-700 hover:text-neutral-300 hover:border-neutral-500'
                          }`}
                        >
                          전체
                        </button>
                        {categories.map((cat) => {
                          const isActive = activeCategory === cat
                          const colorCls = CATEGORY_COLOR[cat] ?? 'text-neutral-400 border-neutral-700'
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setActiveCategory(isActive ? null : cat)}
                              className={`text-[11px] font-mono px-3 py-1 rounded-full border transition-all duration-150 ${
                                isActive
                                  ? `${colorCls} opacity-100`
                                  : 'text-neutral-500 border-neutral-700 hover:text-neutral-300 hover:border-neutral-500'
                              }`}
                            >
                              {cat}
                            </button>
                          )
                        })}
                        <button
                          type="button"
                          onClick={() => setVisitedOnly((v) => !v)}
                          className={`ml-auto text-[11px] font-mono px-3 py-1 rounded-full border transition-all duration-150 ${
                            visitedOnly
                              ? 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10'
                              : 'text-neutral-500 border-neutral-700 hover:text-neutral-300 hover:border-neutral-500'
                          }`}
                        >
                          방문만 보기
                        </button>
                      </div>
                    )}

                    {current.items.length === 0 ? (
                      <p className="text-neutral-600 font-mono text-sm py-10 text-center">
                        아직 등록된 맛집이 없어요.
                      </p>
                    ) : filteredItems.length === 0 ? (
                      <p className="text-neutral-600 font-mono text-sm py-10 text-center">
                        조건에 맞는 식당이 없어요.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {filteredItems.map((item, i) => (
                          <RestaurantCard
                            key={item.id}
                            item={item}
                            index={i}
                            selected={selectedItem?.id === item.id}
                            onSelect={handleSelectItem}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
