'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'

export default function ArcadeLeaderboard({ gameId, refreshKey = 0 }: { gameId: string; refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath={`/api/arcade/scores?gameId=${gameId}`}
      refreshKey={refreshKey}
      title="랭킹 TOP 10"
      columns={[{ key: 'score', label: '점수', format: (v) => Number(v).toLocaleString() }]}
      emptyText="아직 기록이 없습니다"
    />
  )
}
