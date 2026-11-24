import type { Metadata } from 'next'
import GameShell from '@/components/site/GameShell'

export const metadata: Metadata = {
  title: 'Terminal',
  description: '명령어로 둘러보는 kuuuma 터미널.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GameShell game="terminal">{children}</GameShell>
}
