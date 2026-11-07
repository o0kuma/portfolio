'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'
import { useLanguage } from '@/lib/LanguageContext'

export default function TetrisLeaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  const { locale } = useLanguage()
  const en = locale === 'en'
  return (
    <GameLeaderboard
      apiPath="/api/tetris/scores"
      refreshKey={refreshKey}
      title={en ? 'Top 10' : '랭킹 TOP 10'}
      columns={[
        { key: 'stage', label: en ? 'Stage' : '스테이지' },
        { key: 'lines', label: en ? 'Lines' : '라인' },
        { key: 'score', label: en ? 'Score' : '점수', format: (v) => Number(v).toLocaleString() },
      ]}
      emptyText={en ? 'No scores yet' : '아직 기록이 없습니다'}
    />
  )
}
