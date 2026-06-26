import type { Metadata } from 'next'
import GuestbookClient from './GuestbookClient'

export const metadata: Metadata = {
  title: 'Guestbook',
  description: '방명록 — 방문해주셔서 감사합니다. 짧은 메시지를 남겨주세요.',
  openGraph: {
    images: [{ url: '/api/og?title=Guestbook&sub=방명록&category=life' }],
  },
}

export default function GuestbookPage() {
  return <GuestbookClient />
}
