'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'
import { formatTime } from '@/lib/survive/storage'

export default function SurviveLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath="/api/survive/scores"
      refreshKey={refreshKey}
      title="Top 10"
      columns={[
        { key: 'timeSec', label: 'Time', format: (v) => formatTime(Number(v)) },
        { key: 'level', label: 'Lv' },
        { key: 'kills', label: 'Kills' },
      ]}
      emptyText="No records yet"
    />
  )
}
