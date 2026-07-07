import type { Metadata } from 'next'
import AetheriaPageClient from './AetheriaPageClient'

export const metadata: Metadata = {
  title: 'Project Aetheria',
  description: 'An AI simulation where GPT and Gemini agents interact autonomously.',
  openGraph: {
    title: 'Project Aetheria | Portfolio',
    description: 'Multi-LLM Autonomous Agent Simulation',
  },
}

export default function AetheriaPage() {
  return <AetheriaPageClient />
}
