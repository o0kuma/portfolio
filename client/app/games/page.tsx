import type { Metadata } from 'next'
import GamesPageClient from './GamesPageClient'

export const metadata: Metadata = {
  title: 'Games',
  description: '브라우저에서 바로 즐기는 미니 게임 모음 — 테트리스, 타워 디펜스.',
  openGraph: {
    title: 'Games | Portfolio',
    description: 'Mini games you can play right in your browser.',
  },
}

export default function GamesPage() {
  return <GamesPageClient />
}
