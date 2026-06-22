'use client'

import { useEffect, useRef } from 'react'

export default function MarketTickerBar() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'BITSTAMP:BTCUSD', title: 'BTC' },
        { proName: 'BITSTAMP:ETHUSD', title: 'ETH' },
        { proName: 'BITSTAMP:XRPUSD', title: 'XRP' },
        { description: 'KOSPI', proName: 'KRX:KOSPI' },
        { description: 'USD/KRW', proName: 'FX_IDC:USDKRW' },
      ],
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'compact',
      locale: 'en',
    })

    container.appendChild(script)

    return () => {
      if (container.contains(script)) container.removeChild(script)
    }
  }, [])

  return (
    <div className="tradingview-widget-container h-8 w-full overflow-hidden bg-transparent">
      <div ref={containerRef} className="tradingview-widget-container__widget h-full w-full" />
    </div>
  )
}
