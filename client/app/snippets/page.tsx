import type { Metadata } from 'next'
import SnippetsClient from './SnippetsClient'

export const metadata: Metadata = {
  title: 'Code Snippets',
  description: '잘 짠 코드 조각들 — syntax highlight + AI 한줄 설명과 함께',
}

export default function SnippetsPage() {
  return <SnippetsClient />
}
