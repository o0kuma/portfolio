'use client'

import { useState, useMemo } from 'react'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { RestaurantPage, RestaurantItem } from '@/lib/notion'
import PageShell from '@/components/site/PageShell'
import { PageHeader } from '@/components/site/layout'
import { useLanguage } from '@/lib/LanguageContext'

type ViewMode = 'list' | 'map'

type RegionWithItems = RestaurantPage & { items: RestaurantItem[] }

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="shrink-0 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-xs font-extrabold text-ink">
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
      <div className="flex items-center justify-center h-full text-fg-subtle text-xs">
        NEXT_PUBLIC_GOOGLE_MAPS_KEY not set
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

function ImageCarousel({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0)
  if (images.length === 0) return null
  if (images.length === 1) {
    return (
      <div className="relative h-32 w-full">
        <Image src={images[0]} alt={name} fill unoptimized className="object-cover" />
      </div>
    )
  }
  return (
    <div className="relative h-32 w-full overflow-hidden group/carousel">
      <Image src={images[idx]} alt={`${name} ${idx + 1}`} fill unoptimized className="object-cover" />
      {/* Arrow buttons */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length) }}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
        aria-label="Previous"
      >
        ←
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length) }}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
        aria-label="Next"
      >
        →
      </button>
      {/* Dots */}
      <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); setIdx(i) }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white' : 'bg-white/40'}`}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
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
      className={`group rounded-xl border-2 border-ink shadow-ink-sm transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer overflow-hidden ${
        selected
          ? 'bg-cat-food'
          : 'bg-white'
      }`}
    >
      {(item.imageUrls && item.imageUrls.length > 0) && (
        <ImageCarousel images={item.imageUrls} name={item.name} />
      )}
      <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-fg text-sm leading-snug">{item.name}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.checked && (
            <span className="text-xs text-ink border-2 border-ink bg-cat-food font-extrabold px-1.5 py-0.5 rounded">
              가 본 곳
            </span>
          )}
          {item.category && <CategoryBadge category={item.category} />}
          <span
            className={`flex items-center justify-center transition-colors duration-150 p-0.5 ${
              selected ? 'text-fg' : 'text-fg-subtle group-hover:text-fg'
            }`}
          >
            <MapPinIcon />
          </span>
        </div>
      </div>

      {item.menu && (
        <p className="text-xs text-fg-muted leading-relaxed mb-2 line-clamp-2">
          {item.menu}
        </p>
      )}

      {item.address && (
        <p className="text-xs text-fg-subtle truncate mt-auto">
          {item.address}
        </p>
      )}
      </div>
    </motion.div>
  )
}

export default function FoodClient({
  regions,
  error,
}: {
  regions: RegionWithItems[]
  error?: boolean
  errorMessage?: string
}) {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [activeRegion, setActiveRegion] = useState<string>(regions[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [visitedOnly, setVisitedOnly] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RestaurantItem | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

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

  const mapItem = viewMode === 'map' ? (selectedItem ?? filteredItems[0] ?? null) : selectedItem

  function handleSelectItem(item: RestaurantItem) {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item))
  }

  const googleMapsUrl = mapItem
    ? `https://www.google.com/maps/search/${encodeURIComponent(
        mapItem.address ? `${mapItem.name} ${mapItem.address}` : mapItem.name
      )}`
    : ''

  const regionMapUrl = current
    ? `https://www.google.com/maps/search/${encodeURIComponent(current.title + ' 맛집')}`
    : ''

  return (
    <PageShell>
      <PageHeader
        title={en ? 'Food' : '맛집'}
        description={en ? 'Places I have been, by region and type.' : '다녀온 곳을 지역과 종류별로 모아 둡니다.'}
        width="wide"
      />

      <div className="mx-auto w-full max-w-wide px-5 md:px-8">
        {error && (
          <div className="py-20 text-center space-y-2">
            <p className="text-fg-muted text-sm">
              {en ? "Couldn't load the list. Please try again in a moment." : '목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'}
            </p>
          </div>
        )}

        {!error && regions.length === 0 && (
          <p className="py-20 text-center text-sm text-fg-muted">{en ? 'No places yet.' : '아직 등록된 맛집이 없습니다.'}</p>
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
                          ? 'bg-ink text-paper border-ink'
                          : 'text-fg-subtle border-line hover:text-fg hover:bg-panel'
                      }`}
                    >
                      <span>{region.title}</span>
                      <span className={`text-xs tabular-nums ${isActive ? 'text-fg-muted' : 'text-fg-subtle'}`}>
                        {region.items.length}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Desktop: vertical sidebar */}
              <div className="hidden md:block sticky top-24 space-y-0.5">
                <p className="px-3 pb-2 text-xs text-fg-subtle">
                  {en ? 'Regions' : '지역'}
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
                          ? 'bg-ink text-paper border-2 border-ink'
                          : 'text-fg-subtle hover:text-fg hover:bg-white border-2 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="truncate">{region.title}</span>
                      </span>
                      <span className={`text-xs shrink-0 tabular-nums ${isActive ? 'text-fg-muted' : 'text-fg-subtle'}`}>
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
                      <h2 className="text-lg font-bold text-fg flex items-center gap-2">
                        <span>{current.title}</span>
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-fg-subtle">
                          {en ? `${current.items.length} places` : `${current.items.length}곳`}
                        </span>
                        {/* View mode toggle */}
                        <div className="flex items-center border-2 border-ink rounded-full overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`text-xs px-3 py-1 transition-all duration-150 ${
                              viewMode === 'list'
                                ? 'bg-ink text-paper'
                                : 'text-fg-subtle hover:text-fg-muted'
                            }`}
                          >
                            {en ? 'List' : '목록'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setViewMode('map'); setSelectedItem(null) }}
                            className={`text-xs px-3 py-1 transition-all duration-150 flex items-center gap-1 ${
                              viewMode === 'map'
                                ? 'bg-ink text-paper'
                                : 'text-fg-subtle hover:text-fg-muted'
                            }`}
                          >
                            <MapPinIcon size={10} />
                            {en ? 'Map' : '지도'}
                          </button>
                        </div>
                        <a
                          href={regionMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hidden sm:flex items-center gap-1 text-xs text-fg-subtle border border-line-strong hover:text-fg hover:border-line-strong px-2.5 py-1 rounded-full transition-all duration-150"
                        >
                          <MapPinIcon />
                          <span>{en ? 'Full map' : '지도에서 보기'}</span>
                          <ExternalLinkIcon />
                        </a>
                      </div>
                    </div>

                    {/* ── MAP VIEW ─────────────────────────────────── */}
                    {viewMode === 'map' && (
                      <div className="flex gap-4" style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>
                        {/* Restaurant list (left) */}
                        <div className="w-64 shrink-0 overflow-y-auto flex flex-col gap-1.5 pr-1 scrollbar-none">
                          {filteredItems.length === 0 ? (
                            <p className="text-fg-subtle text-xs py-6 text-center">
                              {en ? 'No places' : '맛집이 없습니다'}
                            </p>
                          ) : filteredItems.map((item) => {
                            const isActive = mapItem?.id === item.id
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                className={`text-left px-3 py-2.5 rounded-lg border transition-all duration-150 w-full ${
                                  isActive
                                    ? 'border-ink bg-cat-food text-ink'
                                    : 'border-line bg-panel text-fg-muted hover:border-line-strong hover:text-fg'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {isActive && <MapPinIcon size={11} />}
                                  <span className="text-xs font-semibold truncate">{item.name}</span>
                                </div>
                                {item.category && (
                                  <span className="text-xs text-fg-subtle">{item.category}</span>
                                )}
                                {item.address && (
                                  <p className="text-xs text-fg-subtle truncate mt-0.5">{item.address}</p>
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Map (right) */}
                        <div className="flex-1 min-w-0 rounded-xl border-2 border-ink shadow-ink overflow-hidden bg-white flex flex-col">
                          {mapItem ? (
                            <>
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-line shrink-0">
                                <div className="flex items-center gap-2 text-sm text-fg-muted min-w-0">
                                  <MapPinIcon size={13} />
                                  <span className="font-semibold truncate">{mapItem.name}</span>
                                  {mapItem.address && (
                                    <span className="text-fg-subtle text-xs truncate hidden sm:block">
                                      {mapItem.address}
                                    </span>
                                  )}
                                </div>
                                <a
                                  href={googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-fg-subtle hover:text-fg transition-colors shrink-0"
                                >
                                  {en ? 'Open in Google Maps' : '구글 지도에서 열기'}
                                  <ExternalLinkIcon />
                                </a>
                              </div>
                              <div className="flex-1">
                                <GoogleMapEmbed item={mapItem} />
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 flex items-center justify-center text-fg-subtle text-sm">
                              {en ? 'Pick a place' : '맛집을 골라 주세요'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── LIST VIEW ────────────────────────────────── */}
                    {viewMode === 'list' && (
                      <>
                        {/* Google Map embed panel (list mode — click to show) */}
                        <AnimatePresence>
                          {selectedItem && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 360 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                              className="mb-5 overflow-hidden rounded-xl border-2 border-ink bg-white shadow-ink"
                            >
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
                                <div className="flex items-center gap-2 text-sm text-fg-muted">
                                  <MapPinIcon size={14} />
                                  <span className="font-semibold">{selectedItem.name}</span>
                                  {selectedItem.address && (
                                    <span className="text-fg-subtle text-xs truncate max-w-[200px]">
                                      {selectedItem.address}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-fg-subtle hover:text-fg transition-colors"
                                  >
                                    Open in Google Maps
                                    <ExternalLinkIcon />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedItem(null)}
                                    className="text-fg-subtle hover:text-fg-muted transition-colors p-0.5"
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
                            placeholder={en ? 'Search by name' : '이름으로 찾기'}
                            className="w-full bg-white border-2 border-ink text-ink text-sm rounded-xl px-4 py-2.5 shadow-ink-sm placeholder:text-ink-soft focus:outline-none"
                          />
                        </div>

                        {/* Category filter pills + visited toggle */}
                        {categories.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mb-6">
                            <button
                              type="button"
                              onClick={() => setActiveCategory(null)}
                              className={`text-xs px-3 py-1 rounded-full border-2 font-extrabold transition-all duration-150 ${
                                activeCategory === null
                                  ? 'border-ink bg-ink text-paper'
                                  : 'text-fg-subtle border-line-strong hover:text-fg-muted hover:border-line-strong'
                              }`}
                            >
                              {en ? 'All' : '전체'}
                            </button>
                            {categories.map((cat) => {
                              const isActive = activeCategory === cat
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setActiveCategory(isActive ? null : cat)}
                                  className={`text-xs px-3 py-1 rounded-full border-2 font-extrabold transition-all duration-150 ${
                                    isActive
                                      ? 'border-ink bg-ink text-paper'
                                      : 'text-fg-subtle border-line-strong hover:text-fg-muted hover:border-line-strong'
                                  }`}
                                >
                                  {cat}
                                </button>
                              )
                            })}
                            <button
                              type="button"
                              onClick={() => setVisitedOnly((v) => !v)}
                              className={`ml-auto text-xs px-3 py-1 rounded-full border-2 font-extrabold transition-all duration-150 ${
                                visitedOnly
                                  ? 'text-star border-star/60'
                                  : 'text-fg-subtle border-line-strong hover:text-fg-muted hover:border-line-strong'
                              }`}
                            >
                              {en ? 'Visited only' : '가 본 곳만'}
                            </button>
                          </div>
                        )}

                        {current.items.length === 0 ? (
                          <p className="text-fg-subtle text-sm py-10 text-center">
                            {en ? 'No places yet.' : '아직 등록된 맛집이 없습니다.'}
                          </p>
                        ) : filteredItems.length === 0 ? (
                          <p className="text-fg-subtle text-sm py-10 text-center">
                            {en ? 'No places match these filters.' : '조건에 맞는 맛집이 없습니다.'}
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
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        )}
      </div>
    </PageShell>
  )
}
