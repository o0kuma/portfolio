import type { Metadata } from 'next'
import TowerDefensePageClient from './TowerDefensePageClient'

export const metadata: Metadata = {
  title: 'Tower Defense',
  description:
    '브라우저 픽셀 타워 디펜스 — 정해진 길을 따라오는 적을 타워로 막고 끝없는 웨이브에서 최대한 오래 버티세요.',
  openGraph: {
    title: 'Tower Defense | Portfolio',
    description: '픽셀 레트로 타워 디펜스 — 타워를 배치하고 강화하며 끝없는 웨이브를 막아내세요.',
  },
}

export default function TowerDefensePage() {
  return <TowerDefensePageClient />
}
