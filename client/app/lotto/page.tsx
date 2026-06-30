import type { Metadata } from 'next'
import LottoPageClient from './LottoPageClient'

export const metadata: Metadata = {
  title: '로또 번호 맞추기',
  description:
    '로또 6/45 시뮬레이션 게임. 번호를 고르고 추첨에 도전하거나, 실제 역대 당첨 회차와 비교하고, 1등이 나올 때까지 무한 자동 구매를 돌려보세요.',
  openGraph: {
    title: '로또 번호 맞추기 | Portfolio',
    description: '시뮬레이션 · 역대 회차 도전 · 무한 자동 — 로또 6/45 게임',
  },
}

export default function LottoPage() {
  return <LottoPageClient />
}
