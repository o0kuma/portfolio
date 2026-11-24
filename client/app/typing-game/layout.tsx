import type { Metadata } from 'next'
import GameShell from '@/components/site/GameShell'

export const metadata: Metadata = {
  title: 'Typing Game',
  description: '코드 스니펫 타이핑 게임.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GameShell game="typing">{children}</GameShell>
}
