'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'
import { formatTime } from '@/lib/survive/storage'

export default function SurviveLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath="/api/survive/scores"
      refreshKey={refreshKey}
      title="랭킹 TOP 10"
      columns={[
        { key: 'timeSec', label: '시간', format: (v) => formatTime(Number(v)) },
        { key: 'level', label: 'Lv' },
        { key: 'kills', label: '처치' },
      ]}
      emptyText="아직 기록이 없습니다"
    />
  )
}
