'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiTrendingUp } from 'react-icons/fi'

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

function TradingViewChart({ symbol }: { symbol: string }) {
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
      dateRange: '1M',
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
  }, [symbol])

  return <div ref={ref} className="w-full h-[220px] overflow-hidden" />
}

export default function MarketWidget() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(TICKERS[0].id)

  const current = TICKERS.find((t) => t.id === active) ?? TICKERS[0]

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="시장 시세"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-neutral-100 flex items-center justify-center shadow-lg shadow-black/40 transition-all duration-200"
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
            className="fixed bottom-22 right-6 z-50 w-[360px] rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase">Market</span>
              <button type="button" onClick={() => setOpen(false)} className="text-neutral-600 hover:text-neutral-300 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            {/* Ticker tabs */}
            <div className="flex overflow-x-auto gap-1 px-3 py-2 border-b border-neutral-800 scrollbar-none">
              {TICKERS.map((t) => (
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

            {/* Chart */}
            <div className="px-2 py-2 bg-neutral-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <TradingViewChart symbol={current.symbol} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-700">Powered by TradingView</span>
              <a
                href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(current.symbol)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                차트 보기 →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
