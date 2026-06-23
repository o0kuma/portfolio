'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'

export default function TypingLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath="/api/typing-game/scores"
      refreshKey={refreshKey}
      title="랭킹 TOP 10"
      columns={[
        { key: 'wpm', label: 'WPM' },
        { key: 'accuracy', label: '정확도', format: (v) => `${v}%` },
      ]}
      emptyText="아직 기록이 없습니다"
    />
  )
}
