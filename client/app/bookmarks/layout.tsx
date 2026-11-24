import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: '저장한 글과 자주 찾는 개발 링크.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
