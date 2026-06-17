import type { Metadata } from 'next'
import GamesPageClient from './GamesPageClient'

export const metadata: Metadata = {
  title: 'Games',
  description: '브라우저에서 바로 즐기는 미니 게임 — 테트리스, 서바이브, 타워 디펜스.',
  openGraph: {
    title: 'Games | kuuuma',
    description: '테트리스 · 서바이브 · 타워 디펜스 미니 게임 허브',
  },
}

export default function GamesPage() {
  return <GamesPageClient />
}
