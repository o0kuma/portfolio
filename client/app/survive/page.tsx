import type { Metadata } from 'next'
import SurvivePageClient from './SurvivePageClient'

export const metadata: Metadata = {
  title: 'Survive',
  description:
    '브라우저 뱀서라이크 생존 게임 — 몰려오는 적을 자동 공격으로 처치하고 레벨업으로 강해지며 오래 버티세요.',
  openGraph: {
    title: 'Survive | Portfolio',
    description: '자동 공격 + 레벨업 강화로 버티는 캐주얼 생존 액션',
  },
}

export default function SurvivePage() {
  return <SurvivePageClient />
}
