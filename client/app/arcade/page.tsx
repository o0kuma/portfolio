import type { Metadata } from 'next'
import ArcadeMenuClient from './ArcadeMenuClient'

export const metadata: Metadata = {
  title: 'Pocket Arcade',
  description: 'A collection of one-tap, ultra-short mini games. Collect coins and chase high scores.',
  openGraph: {
    title: 'Pocket Arcade | Portfolio',
    description: 'A collection of mini games you can play one-handed',
  },
}

export default function ArcadePage() {
  return <ArcadeMenuClient />
}
