import type { Metadata } from 'next'
import LottoPageClient from './LottoPageClient'

export const metadata: Metadata = {
  title: 'Lotto Number Match',
  description:
    'A Lotto 6/45 simulation game. Pick numbers and try the draw, compare against real past winning draws, or run infinite auto-purchases until you hit 1st prize.',
  openGraph: {
    title: 'Lotto Number Match | Portfolio',
    description: 'Simulation · Past Draw Challenge · Infinite Auto — a Lotto 6/45 game',
  },
}

export default function LottoPage() {
  return <LottoPageClient />
}
