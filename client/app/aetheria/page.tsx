import type { Metadata } from 'next'
import AetheriaPageClient from './AetheriaPageClient'

export const metadata: Metadata = {
  title: 'Project Aetheria',
  description: 'GPT와 Gemini 에이전트가 자율적으로 상호작용하는 AI 시뮬레이션.',
  openGraph: {
    title: 'Project Aetheria | Portfolio',
    description: 'Multi-LLM Autonomous Agent Simulation',
  },
}

export default function AetheriaPage() {
  return <AetheriaPageClient />
}
