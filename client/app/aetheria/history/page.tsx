import type { Metadata } from 'next'
import AetheriaHistoryClient from './AetheriaHistoryClient'

export const metadata: Metadata = {
  title: 'Aetheria Chronicle',
  description:
    'Project Aetheria — the hall of fame and season history of an autonomous multi-LLM (GPT + Gemini) agent simulation.',
  alternates: { canonical: '/aetheria/history' },
}

export default function AetheriaHistoryPage() {
  return <AetheriaHistoryClient />
}
