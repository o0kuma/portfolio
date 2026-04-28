import type { Metadata } from 'next'
import TetrisPageClient from './TetrisPageClient'

export const metadata: Metadata = {
  title: '테트리스',
  description:
    '브라우저에서 플레이하는 테트리스. 키보드와 터치를 지원합니다.',
  openGraph: {
    title: '테트리스 | iykyk blog',
    description: '포트폴리오 데모 — 테트리스',
    type: 'website',
  },
}

export default function TetrisPage() {
  return <TetrisPageClient />
}
