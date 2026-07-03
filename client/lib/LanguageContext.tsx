'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { translations, type Locale, type TranslationDict } from './i18n'

interface LanguageContextType {
  locale: Locale
  t: TranslationDict
  toggleLocale: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  t: translations.en,
  toggleLocale: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang') as Locale | null
      if (saved === 'ko' || saved === 'en') {
        setLocale(saved)
      }
    } catch {
      // localStorage unavailable (e.g. SSR guard)
    }
  }, [])

  const toggleLocale = () => {
    const next: Locale = locale === 'ko' ? 'en' : 'ko'
    setLocale(next)
    try {
      localStorage.setItem('lang', next)
    } catch {
      // ignore
    }
  }

  return (
    <LanguageContext.Provider
      value={{ locale, t: translations[locale] as TranslationDict, toggleLocale }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext)
}
