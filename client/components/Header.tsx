'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiMenu, FiX, FiSearch, FiSettings } from 'react-icons/fi'
import ThemeToggle from './ThemeToggle'
import ThemePicker from './ThemePicker'
import SearchBar from './SearchBar'
import SearchModal from './SearchModal'
import AdminPanel from './AdminPanel'
import { useLanguage } from '@/lib/LanguageContext'
import { hasAdminAccess } from '@/lib/admin-access'

export default function Header() {
  const router = useRouter()
  const { t, toggleLocale } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(hasAdminAccess())
  }, [])

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchModalOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    closeMenu()
  }

  // 포트폴리오 페이지 전용 헤더 — 이 페이지 내 영역 이동만 담당 (다른 메뉴는 메인 페이지 헤더에서만 노출)
  const navItems: Array<{ label: string; id: string }> = [
    { label: t.nav.about, id: 'about' },
    { label: t.nav.skills, id: 'skills' },
    { label: t.nav.projects, id: 'projects' },
    { label: t.nav.contact, id: 'contact' },
  ]

  return (
    <>
      <header
        style={{
          boxShadow: isScrolled ? '0 4px 24px rgb(0 0 0 / 0.08)' : 'none',
        }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800'
            : 'bg-transparent'
        }`}
      >
        <div className="page-shell">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              className="relative text-xl font-semibold tracking-tight text-neutral-100 cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => scrollToSection('hero')}
            >
              Portfolio
            </button>

            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="relative text-neutral-500 hover:text-neutral-100 transition-colors font-medium text-sm tracking-wide group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-neutral-400 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 text-neutral-500 hover:text-neutral-100 transition-colors rounded-lg"
                aria-label={t.header.search}
                title="Search (⌘K)"
              >
                <FiSearch size={20} />
              </button>

              {showAdmin && (
                <button
                  type="button"
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="p-2 text-neutral-500 hover:text-neutral-100 transition-colors rounded-lg"
                  title={t.header.adminPanel}
                >
                  <FiSettings size={20} />
                </button>
              )}

              <button
                type="button"
                onClick={toggleLocale}
                className="px-2.5 py-1 text-neutral-500 hover:text-neutral-100 transition-colors rounded-lg text-xs font-bold tracking-wider border border-current/20 hover:border-current/50"
                aria-label="언어 전환"
              >
                {t.nav.langToggle}
              </button>

              <ThemePicker />

              <ThemeToggle />

              <button
                type="button"
                onClick={toggleMenu}
                className="md:hidden p-2 text-neutral-500 hover:text-neutral-100 transition-colors rounded-lg"
                aria-label={t.header.menu}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
              isSearchOpen ? 'max-h-[28rem] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
            }`}
          >
            <SearchBar
              onSearch={(query) => {
                if (query.trim()) {
                  router.push(`/posts?search=${encodeURIComponent(query.trim())}`)
                }
              }}
              placeholder="Search projects or posts..."
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out border-t border-neutral-800 bg-neutral-950 ${
            isMenuOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="page-shell py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-neutral-200 hover:text-neutral-50 transition-colors font-medium py-2"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
    </>
  )
}
