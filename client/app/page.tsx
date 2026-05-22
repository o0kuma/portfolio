import type { Metadata } from 'next'
import ImmersiveHome from '@/components/home/ImmersiveHome'
import { SITE_NAME, getSiteUrl, OG_IMAGE_PATH } from '@/lib/site'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: `${SITE_NAME} — Blog`,
  description:
    '기술, 경제, 여행 등 다양한 주제의 글과 인사이트를 공유하는 kuuuma.com 블로그.',
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE_NAME} — Blog`,
    description: '기술·경제·여행 등 다양한 주제의 블로그',
    type: 'website',
    url: siteUrl,
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Blog`,
    description: '기술·경제·여행 등 다양한 주제의 블로그',
    images: [OG_IMAGE_PATH],
  },
}

export default function BlogHome() {
  return <ImmersiveHome />
}
