import type { Metadata } from 'next'
import TetrisClient from './TetrisClient'

export const metadata: Metadata = {
  title: 'Tetris',
  description:
    'Play Tetris in the browser: SRS, 7-bag, hold, ghost, and customizable difficulty. Touch or keyboard.',
  openGraph: {
    title: 'Tetris | Portfolio',
    description: 'Guideline-style Tetris with mobile swipe controls',
  },
}

export default function TetrisPage() {
  return <TetrisClient />
}
