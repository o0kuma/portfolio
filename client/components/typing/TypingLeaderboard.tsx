'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'

export default function TypingLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  return (
    <GameLeaderboard
      apiPath="/api/typing-game/scores"
      refreshKey={refreshKey}
      title="Top 10 Ranking"
      columns={[
        { key: 'wpm', label: 'WPM' },
        { key: 'accuracy', label: 'Accuracy', format: (v) => `${v}%` },
      ]}
      emptyText="No records yet"
    />
  )
}
