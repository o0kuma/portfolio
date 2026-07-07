'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'
import { useLanguage } from '@/lib/LanguageContext'

export default function TypingLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  const { locale } = useLanguage()
  const en = locale === 'en'
  return (
    <GameLeaderboard
      apiPath="/api/typing-game/scores"
      refreshKey={refreshKey}
      title={en ? 'Top 10 Ranking' : '랭킹 TOP 10'}
      columns={[
        { key: 'wpm', label: 'WPM' },
        { key: 'accuracy', label: en ? 'Accuracy' : '정확도', format: (v) => `${v}%` },
      ]}
      emptyText={en ? 'No records yet' : '아직 기록이 없습니다'}
    />
  )
}
