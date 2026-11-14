'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { MORE_NAV, PRIMARY_NAV, isActive } from './nav'

/**
 * Site-wide top menu. `overlay` = sits transparent over the home hero until
 * the visitor scrolls, then fills in like on every other page.
 */
export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname()
  const { locale } = useLanguage()
  const en = locale === 'en'
  const [scrolled, setScrolled] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!overlay) return
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlay])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Close menus when the page changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoreOpen(false)
    setMobileOpen(false)
  }, [pathname])

  const solid = !overlay || scrolled || mobileOpen
  const moreActive = MORE_NAV.some((item) => isActive(pathname, item.href))

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        solid ? 'border-b border-line bg-night/90 backdrop-blur' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-wide items-center justify-between px-5 md:px-8">
        <Link href="/" className="font-logo text-xl tracking-tight text-fg">
          kuuuma
        </Link>

        <nav className="hidden items-center gap-7 sm:flex" aria-label={en ? 'Main' : '주 메뉴'}>
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`border-b-2 py-1 text-sm transition-colors ${
                  active ? 'border-star text-fg' : 'border-transparent text-fg-muted hover:text-fg'
                }`}
              >
                {en ? item.en : item.ko}
              </Link>
            )
          })}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={`flex items-center gap-1 border-b-2 py-1 text-sm transition-colors ${
                moreActive ? 'border-star text-fg' : 'border-transparent text-fg-muted hover:text-fg'
              }`}
            >
              {en ? 'More' : '더보기'}
              <FiChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-line bg-panel py-1 shadow-lg shadow-black/40">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-fg-muted transition-colors hover:bg-panel-2 hover:text-fg"
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
          aria-label={mobileOpen ? (en ? 'Close menu' : '메뉴 닫기') : en ? 'Open menu' : '메뉴 열기'}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-fg sm:hidden"
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-line bg-night px-5 pb-8 pt-4 sm:hidden" aria-label={en ? 'Main' : '주 메뉴'}>
          <ul className="space-y-1">
            {[...PRIMARY_NAV, ...MORE_NAV].map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block py-3 text-lg ${active ? 'text-star' : 'text-fg'}`}
                  >
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
