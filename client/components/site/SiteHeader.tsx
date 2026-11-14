'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { Dot, HandNote } from './layout'
import { MORE_NAV, PRIMARY_NAV, isActive } from './nav'

const pill = 'flex items-center gap-2 rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-extrabold transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transform-none'

/** Site-wide top menu: wordmark with a handwritten label, round menu buttons. */
export default function SiteHeader() {
  const pathname = usePathname()
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    // Close menus when the page changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoreOpen(false)
    setMobileOpen(false)
  }, [pathname])

  const moreActive = MORE_NAV.some((item) => isActive(pathname, item.href))

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-wide items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black tracking-[-0.05em] text-ink">kuuuma</span>
          <HandNote className="-rotate-[4deg] text-[20px]">{en ? 'notebook' : '의 기록장'}</HandNote>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label={en ? 'Main' : '주 메뉴'}>
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`${pill} ${active ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}
              >
                {item.section && <Dot section={item.section} />}
                {en ? item.en : item.ko}
              </Link>
            )
          })}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={`${pill} ${moreActive ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}
            >
              {en ? 'More' : '더보기'}
              <FiChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-44 rounded-xl border-2 border-ink bg-white py-1 shadow-ink-sm">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-cat-post"
                  >
                    {en ? item.en : item.ko}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="rounded-xl border-2 border-ink bg-white px-3 py-1.5 text-sm font-extrabold text-ink md:hidden"
        >
          {mobileOpen ? (en ? 'Close' : '닫기') : en ? 'Menu' : '메뉴'}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t-2 border-ink bg-paper px-5 pb-8 pt-4 md:hidden" aria-label={en ? 'Main' : '주 메뉴'}>
          <ul className="space-y-2">
            {[...PRIMARY_NAV, ...MORE_NAV].map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl border-2 border-ink px-4 py-3 text-lg font-extrabold ${
                      active ? 'bg-ink text-paper' : 'bg-white text-ink'
                    }`}
                  >
                    {item.section && <Dot section={item.section} />}
                    {en ? item.en : item.ko}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
