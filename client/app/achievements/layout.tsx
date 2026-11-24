import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Achievements',
  description: '게임과 사이트 탐험으로 여는 업적.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
