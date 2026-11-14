import GameShell from '@/components/site/GameShell'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GameShell game="lotto">{children}</GameShell>
}
