import type { Metadata, Viewport } from 'next'
import GameShell from '@/components/site/GameShell'

export const metadata: Metadata = {
  manifest: '/arcade-manifest.json',
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Arcade',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFBF0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function ArcadeLayout({ children }: { children: React.ReactNode }) {
  return <GameShell game="arcade">{children}</GameShell>
}
