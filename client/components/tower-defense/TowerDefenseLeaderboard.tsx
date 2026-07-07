'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'

export default function TowerDefenseLeaderboard({
  refreshKey = 0,
  day = null,
}: {
  refreshKey?: number
  /** when set, shows that day's daily-challenge leaderboard */
  day?: string | null
}) {
  return (
    <GameLeaderboard
      apiPath="/api/tower-defense/scores"
      refreshKey={refreshKey}
      day={day ?? undefined}
      title={day ? "Today's Challenge Ranking" : 'Top 10'}
      columns={[
        { key: 'wave', label: 'Wave' },
        { key: 'kills', label: 'Kills' },
      ]}
      emptyText="No records yet"
    />
  )
}
