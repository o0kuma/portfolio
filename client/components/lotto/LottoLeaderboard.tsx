'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'

function formatKRW(v: unknown): string {
  const n = Number(v)
  if (!Number.isFinite(n) || n === 0) return '₩0'
  if (n >= 100_000_000) return `₩${(n / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`
  if (n >= 10_000) return `₩${Math.round(n / 1_000).toLocaleString()}K`
  return `₩${n.toLocaleString()}`
}

export default function LottoLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath="/api/lotto/scores"
      refreshKey={refreshKey}
      title="Top 10 Ranking"
      columns={[
        { key: 'bestRank', label: 'Best Rank' },
        { key: 'wins', label: 'Wins', format: (v) => `${Number(v)}` },
        { key: 'totalPrize', label: 'Total', format: formatKRW },
      ]}
      emptyText="No winners yet"
    />
  )
}
