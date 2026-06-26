import type { Metadata } from 'next'
import SnippetsClient from './SnippetsClient'

export const metadata: Metadata = {
  title: 'Code Snippets',
  description: '잘 짠 코드 조각들 — syntax highlight + AI 한줄 설명과 함께',
  openGraph: {
    images: [{ url: '/api/og?title=Code+Snippets&sub=코드+스니펫+쇼케이스&category=dev' }],
  },
}

export default function SnippetsPage() {
  return <SnippetsClient />
}
