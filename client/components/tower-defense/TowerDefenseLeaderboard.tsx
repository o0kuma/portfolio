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
      title={day ? '오늘의 챌린지 랭킹' : '랭킹 TOP 10'}
      columns={[
        { key: 'wave', label: '웨이브' },
        { key: 'kills', label: '처치' },
      ]}
      emptyText="아직 기록이 없습니다"
    />
  )
}
