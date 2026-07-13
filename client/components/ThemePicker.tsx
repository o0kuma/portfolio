'use client'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const THEMES = [
  { id: 'default', labelKo: '기본 (다크)', labelEn: 'Default (Dark)', color: '#262626', accent: '#737373' },
  { id: 'terminal', labelKo: '터미널', labelEn: 'Terminal', color: '#0a0f0a', accent: '#4ade80' },
  { id: 'ocean', labelKo: '오션', labelEn: 'Ocean', color: '#020818', accent: '#3b82f6' },
  { id: 'sunset', labelKo: '선셋', labelEn: 'Sunset', color: '#0f0a08', accent: '#f97316' },
]

export default function ThemePicker() {
  const { locale } = useLanguage()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('default')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('color-theme') ?? 'default'
    setCurrent(saved)
    if (saved !== 'default') document.documentElement.setAttribute('data-theme', saved)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const pick = (id: string) => {
    setCurrent(id)
    localStorage.setItem('color-theme', id)
    if (id === 'default') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', id)
    setOpen(false)
  }

  const activTheme = THEMES.find(t => t.id === current) ?? THEMES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
        title={locale === 'en' ? 'Choose theme' : '테마 선택'}
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-neutral-600 inline-block"
          style={{ background: activTheme.accent }}
        />
        <span className="text-xs text-neutral-400 hidden sm:inline">{locale === 'en' ? 'Theme' : '테마'}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-neutral-900 border border-neutral-700 rounded-xl p-2 z-50 shadow-xl min-w-[140px]">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => pick(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                current === t.id
                  ? 'bg-neutral-700 text-neutral-100'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: t.accent }}
              />
              {locale === 'en' ? t.labelEn : t.labelKo}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
