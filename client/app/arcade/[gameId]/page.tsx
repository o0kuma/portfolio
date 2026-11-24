import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ARCADE_GAMES } from '@/lib/arcade/registry'
import ArcadePlayClient from './ArcadePlayClient'

export function generateStaticParams() {
  return ARCADE_GAMES.map((g) => ({ gameId: g.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ gameId: string }> }): Promise<Metadata> {
  const { gameId } = await params
  const game = ARCADE_GAMES.find((g) => g.id === gameId)
  return game ? { title: `${game.title} · Pocket Arcade`, description: game.instruction } : {}
}

export default async function ArcadeGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params
  const exists = ARCADE_GAMES.some((g) => g.id === gameId)
  if (!exists) notFound()
  return <ArcadePlayClient gameId={gameId} />
}
