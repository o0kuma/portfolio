'use client'

import GameLeaderboard from '@/components/ui/GameLeaderboard'
import { useLanguage } from '@/lib/LanguageContext'

export default function TowerDefenseLeaderboard({
  refreshKey = 0,
  day = null,
}: {
  refreshKey?: number
  /** when set, shows that day's daily-challenge leaderboard */
  day?: string | null
}) {
  const { locale } = useLanguage()
  const en = locale === 'en'
  return (
    <GameLeaderboard
      apiPath="/api/tower-defense/scores"
      refreshKey={refreshKey}
      day={day ?? undefined}
      title={en ? (day ? "Today's Challenge Ranking" : 'Top 10') : (day ? '오늘의 도전 랭킹' : '랭킹 TOP 10')}
      columns={[
        { key: 'wave', label: en ? 'Wave' : '웨이브' },
        { key: 'kills', label: en ? 'Kills' : '처치' },
      ]}
      emptyText={en ? 'No records yet' : '아직 기록이 없습니다'}
    />
  )
}
