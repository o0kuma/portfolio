'use client'

import { useLanguage } from '@/lib/LanguageContext'

/**
 * Renders locale-appropriate text inside otherwise-static (server) markup.
 * The site locale is client-only (localStorage), so server components can't
 * branch on it directly — drop this client island in where a label needs it.
 */
export default function LocaleText({ ko, en }: { ko: string; en: string }) {
  const { locale } = useLanguage()
  return <>{locale === 'en' ? en : ko}</>
}
