import type { Metadata } from 'next'
import PortfolioClient from './PortfolioClient'

export const metadata: Metadata = {
  title: 'Okuma - Portfolio',
  description: '프론트엔드 개발자 Okuma 포트폴리오 웹사이트. Next.js, React, TypeScript, Tailwind CSS 등을 활용한 프로젝트들과 개발 경험을 공유합니다.',
  keywords: [
    '포트폴리오',
    '웹 개발자',
    '프론트엔드',
    '백엔드',
    'React',
    'Next.js',
    'Node.js',
    'MongoDB',
    'TypeScript',
    'Tailwind CSS'
  ],
  openGraph: {
    title: 'Okuma - Portfolio',
    description: '프론트엔드 개발자 Okuma 포트폴리오 웹사이트',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Okuma - 포트폴리오',
    description: '프론트엔드 개발자 Okuma 포트폴리오 웹사이트',
  },
}

export default function Portfolio() {
  return <PortfolioClient />
}
