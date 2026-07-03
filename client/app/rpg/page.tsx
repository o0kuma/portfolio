import type { Metadata } from 'next'
import RPGPageClient from './RPGPageClient'

export const metadata: Metadata = {
  title: 'kuuuma World — RPG 포트폴리오',
  description: '도트 그래픽 RPG로 탐험하는 포트폴리오. 소개, 스킬, 프로젝트, 경력을 건물을 돌아다니며 확인하세요.',
  openGraph: {
    title: 'kuuuma World | Portfolio',
    description: 'RPG 스타일로 탐험하는 오승일의 포트폴리오',
  },
}

export default function RPGPage() {
  return <RPGPageClient />
}
