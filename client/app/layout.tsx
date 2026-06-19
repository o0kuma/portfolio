import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import PageTransition from '@/components/PageTransition'
import ToastContainer from '@/components/ui/ToastContainer'
import WebVitals from '@/components/WebVitals'
import {
  getSiteUrl,
  SITE_NAME,
  SITE_AUTHOR,
  SITE_GITHUB,
} from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    '오승일(Seungil Oh)의 포트폴리오와 블로그 — React, Next.js, TypeScript 기반 웹 개발 프로젝트와 기술 글.',
  keywords: [
    'kuuuma',
    '포트폴리오',
    '웹 개발자',
    '프론트엔드',
    '풀스택',
    'React',
    'Next.js',
    'TypeScript',
    '블로그',
  ],
  authors: [{ name: SITE_AUTHOR }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    title: SITE_NAME,
    description: '오승일의 포트폴리오 · 블로그 · 프로젝트',
    siteName: SITE_NAME,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent(SITE_NAME)}`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: '오승일의 포트폴리오 · 블로그 · 프로젝트',
    images: [`/api/og?title=${encodeURIComponent(SITE_NAME)}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontVars = `${inter.variable} ${fraunces.variable}`

  return (
    <html lang="ko" className={`scroll-smooth dark ${fontVars}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: SITE_AUTHOR,
              alternateName: 'Seungil Oh',
              jobTitle: '프론트엔드 / 풀스택 개발자',
              description: 'React, Next.js, Node.js, PostgreSQL을 활용한 웹 개발자',
              url: siteUrl,
              sameAs: [SITE_GITHUB],
              knowsAbout: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS'],
              worksFor: {
                '@type': 'Organization',
                name: 'Freelance Developer',
              },
            }),
          }}
        />

        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />

        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <WebVitals />
        <Providers><PageTransition>{children}</PageTransition></Providers>
        <ToastContainer />
      </body>
    </html>
  )
}
