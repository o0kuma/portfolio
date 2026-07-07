import type { Metadata } from 'next'
import GamesPageClient from './GamesPageClient'

export const metadata: Metadata = {
  title: 'Games',
  description: 'Mini games you can play right in your browser — Tetris, Survive, Tower Defense.',
  openGraph: {
    title: 'Games | kuuuma',
    description: 'Tetris · Survive · Tower Defense mini game hub',
    images: [{ url: '/api/og?title=Game+Hub&sub=Browser+Mini+Games&category=dev' }],
  },
}

export default function GamesPage() {
  return <GamesPageClient />
}
