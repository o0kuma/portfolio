import { NextResponse } from 'next/server'

export const revalidate = 60

const SYMBOLS = [
  { yahoo: 'BTC-USD', label: 'BTC' },
  { yahoo: 'XRP-USD', label: 'XRP' },
  { yahoo: 'KRW=X', label: 'USD/KRW' },
  { yahoo: '^KS11', label: 'KOSPI' },
  { yahoo: '005930.KS', label: '삼성전자' },
  { yahoo: 'GC=F', label: 'GOLD' },
  { yahoo: '^TNX', label: 'US 10Y' },
]

async function fetchSymbol(yahoo: string, label: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1d&range=1d`
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json',
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${yahoo}`)

  const data = await res.json()
  const meta = data?.chart?.result?.[0]?.meta
  if (!meta) throw new Error(`No meta for ${yahoo}`)

  const price: number = meta.regularMarketPrice
  const previousClose: number = meta.previousClose ?? meta.chartPreviousClose
  const change = price - previousClose
  const changePercent = (change / previousClose) * 100

  return { symbol: label, price, change, changePercent }
}

export async function GET() {
  const results = await Promise.allSettled(
    SYMBOLS.map(({ yahoo, label }) => fetchSymbol(yahoo, label))
  )

  const items = results
    .filter(
      (r): r is PromiseFulfilledResult<{
        symbol: string
        price: number
        change: number
        changePercent: number
      }> => r.status === 'fulfilled'
    )
    .map((r) => r.value)

  return NextResponse.json(items)
}
