import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

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

export const metadata: Metadata = {
  title: {
    default: 'iykyk blog',
    template: '%s | iykyk blog'
  },
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
  authors: [{ name: '승짱' }],
  creator: '승짱',
  publisher: '승짱',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://portfolio-pi-eight-svjrkqfkn0.vercel.app/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://portfolio-pi-eight-svjrkqfkn0.vercel.app/',
    title: 'Portfolio',
    description: '프론트엔드 개발자 Okuma 포트폴리오 웹사이트',
    siteName: 'Okuma 포트폴리오',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Okuma 포트폴리오',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Okuma - 포트폴리오',
    description: '프론트엔드 개발자 Okuma 포트폴리오 웹사이트',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
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
        {/* 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Okuma",
              "jobTitle": "프론트엔드 개발자",
              "description": "Next.js, React, Node.js, MongoDB를 활용한 웹 개발자",
              "url": "https://portfolio-pi-eight-svjrkqfkn0.vercel.app/",
              "sameAs": [
                "https://github.com/oikikomori",
                "https://linkedin.com/in/yourusername",
                "https://twitter.com/yourusername"
              ],
              "knowsAbout": [
                "React",
                "Next.js",
                "Node.js",
                "MongoDB",
                "TypeScript",
                "Tailwind CSS"
              ],
              "worksFor": {
                "@type": "Organization",
                "name": "자유 개발자"
              }
            })
          }}
        />

        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Okuma 포트폴리오" />

        {/* Default dark; only remove when user chose light (localStorage) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
