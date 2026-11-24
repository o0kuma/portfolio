import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '서비스 이용약관',
  description: 'kuuuma.com 서비스 이용약관.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
