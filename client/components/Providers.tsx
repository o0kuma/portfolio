'use client'

import { LanguageProvider } from '@/lib/LanguageContext'
import { ThemeProvider } from '@/lib/ThemeContext'
import { SiteSettingsProvider } from '@/lib/siteSettings'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SiteSettingsProvider>{children}</SiteSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
