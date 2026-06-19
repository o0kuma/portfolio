'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'

export default function TetrisLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath="/api/tetris/scores"
      refreshKey={refreshKey}
      title="랭킹 TOP 10"
      columns={[
        { key: 'stage', label: '스테이지' },
        { key: 'lines', label: '라인' },
        { key: 'score', label: '점수', format: (v) => Number(v).toLocaleString() },
      ]}
      emptyText="아직 기록이 없습니다"
    />
  )
}
