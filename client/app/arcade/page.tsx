import type { Metadata } from 'next'
import ArcadeMenuClient from './ArcadeMenuClient'

export const metadata: Metadata = {
  title: '포켓 아케이드',
  description: '원터치로 즐기는 초단타 미니게임 모음. 코인을 모으고 최고 기록에 도전하세요.',
  openGraph: {
    title: '포켓 아케이드 | Portfolio',
    description: '한 손으로 즐기는 미니게임 모음',
  },
}

export default function ArcadePage() {
  return <ArcadeMenuClient />
}
