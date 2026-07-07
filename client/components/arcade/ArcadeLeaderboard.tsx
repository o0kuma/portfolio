'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'
import { useLanguage } from '@/lib/LanguageContext'

export default function ArcadeLeaderboard({ gameId, refreshKey = 0 }: { gameId: string; refreshKey?: number }) {
  const { locale } = useLanguage()
  const en = locale === 'en'
  return (
    <GameLeaderboard
      apiPath={`/api/arcade/scores?gameId=${gameId}`}
      refreshKey={refreshKey}
      title={en ? 'Top 10' : '랭킹 TOP 10'}
      columns={[{ key: 'score', label: en ? 'Score' : '점수', format: (v) => Number(v).toLocaleString() }]}
      emptyText={en ? 'No records yet' : '아직 기록이 없습니다'}
    />
  )
}
