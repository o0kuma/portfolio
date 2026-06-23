'use client'

import { useEffect, useState } from 'react'

interface TickerItem {
  symbol: string
  price: number
  change: number
  changePercent: number
}

function formatPrice(item: TickerItem): string {
  const { symbol, price } = item
  if (symbol === 'BTC' || symbol === 'GOLD') {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  if (symbol === 'XRP') {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })
  }
  if (symbol === 'KOSPI' || symbol === '삼성전자') {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }
  if (symbol === 'USD/KRW') {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  if (symbol === 'US 10Y') {
    return price.toFixed(2) + '%'
  }
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const marqueeStyle = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 30s linear infinite;
}
`

export default function MarketTickerBar() {
  const [items, setItems] = useState<TickerItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/market')
      if (!res.ok) return
      const data: TickerItem[] = await res.json()
      if (data.length > 0) {
        setItems(data)
        setLoading(false)
      }
    } catch {
      // silently skip on error
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <style>{marqueeStyle}</style>
      <div className="w-full overflow-hidden bg-black/30 backdrop-blur-sm border-b border-white/5 h-10">
        {loading ? (
          <div className="flex items-center h-full px-4 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-20 rounded bg-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center h-full">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...items, ...items].map((item, idx) => {
                const isPositive = item.change >= 0
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-5 text-xs"
                  >
                    <span className="text-white/70 font-medium">
                      {item.symbol}
                    </span>
                    <span className="text-white font-mono">
                      {formatPrice(item)}
                    </span>
                    <span
                      className={
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }
                    >
                      {isPositive ? '▲' : '▼'}{' '}
                      {Math.abs(item.changePercent).toFixed(2)}%
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
