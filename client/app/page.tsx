import type { Metadata } from 'next'
import ImmersiveHome from '@/components/home/ImmersiveHome'

export const metadata: Metadata = {
  title: 'iykyk blog',
  description: 'A space for sharing thoughts, experiences, and insights across various topics and interests.',
  keywords: [
    'blog',
    'personal blog',
    'tech',
    'lifestyle',
    'travel',
    'food',
    'culture',
    'iykyk'
  ],
  openGraph: {
    title: 'iykyk blog',
    description: 'A space for sharing thoughts, experiences, and insights across various topics and interests.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iykyk blog',
    description: 'A space for sharing thoughts, experiences, and insights across various topics and interests.',
  },
}

export default function BlogHome() {
  return <ImmersiveHome />
}
