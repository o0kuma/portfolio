'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'

function formatKRW(v: unknown): string {
  const n = Number(v)
  if (!Number.isFinite(n) || n === 0) return '0원'
  if (n >= 100_000_000) return `${(n / 100_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}억`
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만`
  return `${n.toLocaleString()}원`
}

export default function LottoLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath="/api/lotto/scores"
      refreshKey={refreshKey}
      title="랭킹 TOP 10"
      columns={[
        { key: 'bestRank', label: '최고등수' },
        { key: 'wins', label: '당첨', format: (v) => `${Number(v)}회` },
        { key: 'totalPrize', label: '누적', format: formatKRW },
      ]}
      emptyText="아직 당첨자가 없습니다"
    />
  )
}
