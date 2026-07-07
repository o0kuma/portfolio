'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'

export default function ArcadeLeaderboard({ gameId, refreshKey = 0 }: { gameId: string; refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath={`/api/arcade/scores?gameId=${gameId}`}
      refreshKey={refreshKey}
      title="Top 10"
      columns={[{ key: 'score', label: 'Score', format: (v) => Number(v).toLocaleString() }]}
      emptyText="No records yet"
    />
  )
}
