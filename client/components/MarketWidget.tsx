'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiTrendingUp, FiEdit2 } from 'react-icons/fi'

const TICKERS = [
  { id: 'us10y',   label: '미국 10Y',  symbol: 'TVC:US10Y',        type: 'rate' },
  { id: 'kr10y',   label: '한국 10Y',  symbol: 'TVC:KR10Y',        type: 'rate' },
  { id: 'gold',    label: '금',        symbol: 'TVC:GOLD',         type: 'commodity' },
  { id: 'btc',     label: 'BTC',       symbol: 'BITSTAMP:BTCUSD',  type: 'crypto' },
  { id: 'xrp',     label: 'XRP',       symbol: 'BITSTAMP:XRPUSD',  type: 'crypto' },
  { id: 'usdkrw',  label: 'USD/KRW',   symbol: 'FX_IDC:USDKRW',   type: 'fx' },
  { id: 'kospi',   label: 'KOSPI',     symbol: 'KRX:KOSPI',        type: 'index' },
  { id: 'samsung', label: '삼성전자',  symbol: 'KRX:005930',       type: 'stock' },
]

type DateRange = '1D' | '1W' | '1M' | '3M'
const DATE_RANGES: DateRange[] = ['1D', '1W', '1M', '3M']
const STORAGE_KEY = 'market-widget-tickers'

function TradingViewChart({ symbol, dateRange }: { symbol: string; dateRange: DateRange }) {
  const ref = useRef<HTMLDivElement>(null)
  const idRef = useRef(`tv-${symbol.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''

    const container = document.createElement('div')
    container.id = idRef.current
    ref.current.appendChild(container)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height: 220,
      locale: 'kr',
      dateRange,
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      largeChartUrl: `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`,
      noTimeScale: false,
    })
    container.appendChild(script)

    return () => {
      if (ref.current) ref.current.innerHTML = ''
    }
  }, [symbol, dateRange])

  return <div ref={ref} className="w-full h-[220px] overflow-hidden" />
}

function loadSavedTickers(): string[] {
  if (typeof window === 'undefined') return TICKERS.map((t) => t.id)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return TICKERS.map((t) => t.id)
    const parsed = JSON.parse(raw) as string[]
    const valid = parsed.filter((id) => TICKERS.some((t) => t.id === id))
    return valid.length > 0 ? valid : TICKERS.map((t) => t.id)
  } catch {
    return TICKERS.map((t) => t.id)
  }
}

export default function MarketWidget() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(TICKERS[0].id)
  const [dateRange, setDateRange] = useState<DateRange>('1M')
  const [editOpen, setEditOpen] = useState(false)
  const [enabledIds, setEnabledIds] = useState<string[]>(() => TICKERS.map((t) => t.id))

  // Load from localStorage after mount
  useEffect(() => {
    setEnabledIds(loadSavedTickers())
  }, [])

  const visibleTickers = TICKERS.filter((t) => enabledIds.includes(t.id))
  const current = visibleTickers.find((t) => t.id === active) ?? visibleTickers[0]

  // If active ticker got hidden, switch to first visible
  useEffect(() => {
    if (!visibleTickers.find((t) => t.id === active) && visibleTickers.length > 0) {
      setActive(visibleTickers[0].id)
    }
  }, [enabledIds, active, visibleTickers])

  function toggleTicker(id: string) {
    setEnabledIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
      // enforce minimum 1
      if (next.length === 0) return prev
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="시장 시세"
        className="fixed bottom-6 right-[4.5rem] z-50 w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-neutral-100 flex items-center justify-center shadow-lg shadow-black/40 transition-all duration-200"
      >
        {open ? <FiX size={18} /> : <FiTrendingUp size={18} />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[5.5rem] right-[4.5rem] z-50 w-[360px] rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase">Market</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen((v) => !v)}
                  aria-label="종목 편집"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                    editOpen
                      ? 'bg-neutral-800 border-neutral-600 text-neutral-200'
                      : 'border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  <FiEdit2 size={10} />
                  편집
                </button>
                <button type="button" onClick={() => setOpen(false)} className="text-neutral-600 hover:text-neutral-300 transition-colors">
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Edit overlay */}
            <AnimatePresence>
              {editOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden border-b border-neutral-800 bg-neutral-950"
                >
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-mono text-neutral-500 mb-2 uppercase tracking-widest">표시할 종목 선택</p>
                    <div className="grid grid-cols-2 gap-1">
                      {TICKERS.map((t) => {
                        const checked = enabledIds.includes(t.id)
                        const isLast = enabledIds.length === 1 && checked
                        return (
                          <label
                            key={t.id}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors select-none ${
                              checked ? 'bg-neutral-800 text-neutral-200' : 'text-neutral-500 hover:text-neutral-300'
                            } ${isLast ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isLast}
                              onChange={() => toggleTicker(t.id)}
                              className="accent-neutral-400 w-3 h-3"
                            />
                            <span className="text-[11px] font-mono">{t.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ticker tabs */}
            <div className="flex overflow-x-auto gap-1 px-3 py-2 border-b border-neutral-800 scrollbar-none">
              {visibleTickers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    active === t.id
                      ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Period tabs */}
            <div className="flex gap-1 px-3 pt-2 pb-1">
              {DATE_RANGES.map((dr) => (
                <button
                  key={dr}
                  type="button"
                  onClick={() => setDateRange(dr)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    dateRange === dr
                      ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                      : 'text-neutral-600 hover:text-neutral-400'
                  }`}
                >
                  {dr}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="px-2 py-2 bg-neutral-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${current?.id}-${dateRange}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {current && <TradingViewChart symbol={current.symbol} dateRange={dateRange} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-700">Powered by TradingView</span>
              {current && (
                <a
                  href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(current.symbol)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  차트 보기 →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
