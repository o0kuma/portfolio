import type { Metadata } from 'next'
import { getSiteUrl, SITE_NAME, SITE_AUTHOR } from '@/lib/site'
import PostsListClient from './PostsListClient'

const siteUrl = getSiteUrl()
const description = `${SITE_AUTHOR}의 기술 블로그 — React, Next.js, TypeScript 기반 웹 개발 경험과 프로젝트 회고.`
const ogImage = '/api/og?title=Blog&sub=okuma의+기술+블로그&category=dev'

export const metadata: Metadata = {
  title: `Blog — ${SITE_NAME}`,
  description,
  alternates: { canonical: '/posts' },
  openGraph: {
    title: `Blog — ${SITE_NAME}`,
    description,
    type: 'website',
    url: `${siteUrl}/posts`,
    images: [{ url: ogImage, width: 1200, height: 630, alt: `${SITE_NAME} Blog` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog — ${SITE_NAME}`,
    description,
    images: [ogImage],
  },
}

export default function PostsPage() {
  return <PostsListClient />
}
