import type { Metadata } from 'next'
import RPGPageClient from './RPGPageClient'

export const metadata: Metadata = {
  title: 'kuuuma World — RPG Portfolio',
  description: 'A pixel-art RPG portfolio you can explore. Walk between buildings to see About, Skills, Projects, and Career.',
  openGraph: {
    title: 'kuuuma World | Portfolio',
    description: "okuma's portfolio, explored RPG-style",
  },
}

export default function RPGPage() {
  return <RPGPageClient />
}
