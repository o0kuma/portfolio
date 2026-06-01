import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortfolioClient from './PortfolioClient'
import { SITE_NAME, SITE_AUTHOR, getSiteUrl, OG_IMAGE_PATH, PORTFOLIO_PUBLIC } from '@/lib/site'

const siteUrl = getSiteUrl()

export async function generateMetadata(): Promise<Metadata> {
  if (!PORTFOLIO_PUBLIC) {
    return {}
  }

  return {
    title: `Portfolio — ${SITE_AUTHOR}`,
    description: `${SITE_AUTHOR}의 포트폴리오 — Next.js, React, TypeScript 프로젝트와 개발 경험.`,
    alternates: { canonical: '/portfolio' },
    openGraph: {
      title: `Portfolio — ${SITE_AUTHOR}`,
      description: `${SITE_AUTHOR}의 프론트엔드·풀스택 포트폴리오`,
      type: 'website',
      url: `${siteUrl}/portfolio`,
      images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: `${SITE_NAME} Portfolio` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Portfolio — ${SITE_AUTHOR}`,
      description: `${SITE_AUTHOR}의 프론트엔드·풀스택 포트폴리오`,
      images: [OG_IMAGE_PATH],
    },
  }
}

export default function Portfolio() {
  if (!PORTFOLIO_PUBLIC) {
    notFound()
  }

  return <PortfolioClient />
}
