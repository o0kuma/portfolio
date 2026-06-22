'use client'

import { useEffect, useRef } from 'react'

export default function MarketTickerBar() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container__widget'

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.textContent = JSON.stringify({
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

    container.appendChild(wrapper)
    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container h-10 w-full overflow-hidden"
    />
  )
}
