'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'
import { useLanguage } from '@/lib/LanguageContext'

function formatKRW(v: unknown, locale: 'ko' | 'en' = 'ko'): string {
  const n = Number(v)
  if (locale === 'en') {
    if (!Number.isFinite(n) || n === 0) return '₩0'
    if (n >= 100_000_000) return `₩${(n / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`
    if (n >= 10_000) return `₩${Math.round(n / 1_000).toLocaleString()}K`
    return `₩${n.toLocaleString()}`
  }
  if (!Number.isFinite(n) || n === 0) return '0원'
  if (n >= 100_000_000) return `${(n / 100_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}억`
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만`
  return `${n.toLocaleString()}원`
}

export default function LottoLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  const { locale } = useLanguage()
  const en = locale === 'en'
  return (
    <GameLeaderboard
      apiPath="/api/lotto/scores"
      refreshKey={refreshKey}
      title={en ? 'Top 10 Ranking' : '랭킹 TOP 10'}
      columns={[
        { key: 'bestRank', label: en ? 'Best Rank' : '최고등수' },
        { key: 'wins', label: en ? 'Wins' : '당첨', format: (v) => (en ? `${Number(v)}` : `${Number(v)}회`) },
        { key: 'totalPrize', label: en ? 'Total' : '누적', format: (v) => formatKRW(v, locale === 'en' ? 'en' : 'ko') },
      ]}
      emptyText={en ? 'No winners yet' : '아직 당첨자가 없습니다'}
    />
  )
}
