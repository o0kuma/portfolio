'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiMenu, FiX, FiSun, FiMoon, FiSearch, FiSettings, FiMessageSquare } from 'react-icons/fi'
import SearchBar from './SearchBar'
import AdminPanel from './AdminPanel'
import AIMessenger from './AIMessenger'
import { useLanguage } from '@/lib/LanguageContext'
import { hasAdminAccess } from '@/lib/admin-access'

export default function Header() {
  const router = useRouter()
  const { t, toggleLocale } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false)
  const [isAIMessengerOpen, setIsAIMessengerOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(hasAdminAccess())
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const light = savedTheme === 'light'
    setIsDarkMode(!light)
    if (light) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

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

  const navItems: Array<
    { label: string; kind: 'section'; id: string } | { label: string; kind: 'path'; href: string }
  > = [
    { label: t.nav.about, kind: 'section', id: 'about' },
    { label: t.nav.skills, kind: 'section', id: 'skills' },
    { label: t.nav.projects, kind: 'section', id: 'projects' },
    { label: t.nav.posts, kind: 'section', id: 'posts' },
    { label: t.nav.contact, kind: 'section', id: 'contact' },
    { label: t.nav.tetris, kind: 'path', href: '/tetris' },
    { label: t.nav.food, kind: 'path', href: '/food' },
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

            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) =>
                item.kind === 'section' ? (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="relative text-neutral-500 hover:text-neutral-100 transition-colors font-medium text-sm tracking-wide group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-neutral-400 group-hover:w-full transition-all duration-300" />
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative text-neutral-500 hover:text-neutral-100 transition-colors font-medium text-sm tracking-wide group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-neutral-400 group-hover:w-full transition-all duration-300" />
                  </Link>
                )
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsAIMessengerOpen(!isAIMessengerOpen)}
                className="p-2 text-neutral-500 hover:text-neutral-100 transition-colors relative rounded-lg"
                title={t.header.aiAssistant}
              >
                <FiMessageSquare size={20} />
                {!isAIMessengerOpen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-neutral-500 hover:text-neutral-100 transition-colors rounded-lg"
                aria-expanded={isSearchOpen}
                aria-label={t.header.search}
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

              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 text-neutral-500 hover:text-neutral-100 transition-colors rounded-lg"
                aria-label={isDarkMode ? t.header.lightMode : t.header.darkMode}
              >
                {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

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
              {navItems.map((item) =>
                item.kind === 'section' ? (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-neutral-200 hover:text-neutral-50 transition-colors font-medium py-2"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="text-left text-neutral-200 hover:text-neutral-50 transition-colors font-medium py-2"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>
      </header>

      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />

      <AIMessenger
        isOpen={isAIMessengerOpen}
        onClose={() => setIsAIMessengerOpen(false)}
        context="portfolio"
      />
    </>
  )
}
