'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RestaurantPage, RestaurantItem } from '@/lib/notion'

type RegionWithItems = RestaurantPage & { items: RestaurantItem[] }

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

  const current = regions.find((r) => r.id === activeRegion) ?? regions[0]

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
            <span className="block text-neutral-500 text-2xl md:text-3xl font-medium mt-1">
              Restaurant List
            </span>
          </h1>
        </div>
      </div>

      <div className="container-custom py-12">
        {error && (
          <div className="py-20 text-center space-y-2">
            <div className="text-neutral-500 font-mono text-sm">노션 데이터를 불러오지 못했습니다.</div>
            {errorMessage && (
              <div className="text-red-400 font-mono text-xs">{errorMessage}</div>
            )}
          </div>
        )}

        {!error && regions.length === 0 && (
          <div className="text-neutral-500 font-mono text-sm py-20 text-center">
            등록된 맛집이 없습니다.
          </div>
        )}

        {!error && regions.length > 0 && (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Region sidebar */}
            <aside className="md:w-56 shrink-0">
              <div className="sticky top-24 space-y-1">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setActiveRegion(region.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-mono text-sm transition-colors flex items-center gap-2.5 ${
                      activeRegion === region.id
                        ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                        : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 border border-transparent'
                    }`}
                  >
                    <span className="text-base">{region.emoji || '📍'}</span>
                    <span className="leading-tight">{region.title}</span>
                    <span className="ml-auto text-[10px] text-neutral-600">
                      {region.items.length}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Restaurant list */}
            <main className="flex-1 min-w-0">
              {current && (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="text-xl font-bold text-neutral-200 mb-6 flex items-center gap-2">
                    <span>{current.emoji || '📍'}</span>
                    <span>{current.title}</span>
                  </h2>

                  {current.items.length === 0 ? (
                    <p className="text-neutral-600 font-mono text-sm">아직 등록된 맛집이 없어요.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {current.items.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.04 }}
                          className={`rounded-xl border px-5 py-4 flex items-center gap-3 transition-colors ${
                            item.checked
                              ? 'border-neutral-800 bg-neutral-900/40'
                              : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                          }`}
                        >
                          <span className="text-xl shrink-0">{item.emoji}</span>
                          <span
                            className={`font-medium text-sm leading-tight ${
                              item.checked ? 'line-through text-neutral-600' : 'text-neutral-200'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.checked && (
                            <span className="ml-auto text-[10px] font-mono text-cyan-500 border border-cyan-500/30 px-1.5 py-0.5 rounded shrink-0">
                              방문
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
