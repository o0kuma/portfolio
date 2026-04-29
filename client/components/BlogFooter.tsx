'use client'

import { FiGithub, FiMail, FiArrowUp, FiBook, FiCode, FiUser } from 'react-icons/fi'
import Link from 'next/link'

export default function BlogFooter() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FiMail, href: 'mailto:c8c8c81828@gmail.com', label: 'Email' },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative overflow-hidden border-t border-border bg-surfaceElevated/40 text-textPrimary backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
      </div>

      <div className="page-shell relative z-10">
        <div className="py-20">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-1">
              <Link href="/">
                <h3 className="mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text font-display text-3xl font-bold text-transparent">
                  iykyk blog
                </h3>
              </Link>
              <p className="mb-6 leading-relaxed text-textMuted">
                A space for sharing thoughts, experiences, and insights across various topics and interests.
              </p>

              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel flex h-12 w-12 items-center justify-center rounded-xl text-textMuted transition-all hover:text-white hover:brightness-110"
                    aria-label={social.label}
                  >
                    <social.icon size={22} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                <FiBook size={20} className="text-purple-400" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Posts', href: '/posts' },
                  { name: 'Portfolio', href: '/portfolio' },
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms of Service', href: '/terms' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-textMuted transition-colors hover:text-textPrimary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                <FiCode size={20} className="text-blue-400" />
                Categories
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Tech', href: '/posts?category=tech' },
                  { name: 'Lifestyle', href: '/posts?category=lifestyle' },
                  { name: 'Travel', href: '/posts?category=travel' },
                  { name: 'Food', href: '/posts?category=food' },
                  { name: 'Culture', href: '/posts?category=culture' },
                  { name: 'General', href: '/posts?category=general' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-textMuted transition-colors hover:text-textPrimary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <p className="text-sm text-textMuted">
            © {currentYear} iykyk blog. Made with <span className="text-red-400">❤</span> by Okuma
          </p>

          <div className="flex items-center gap-2 text-sm text-textMuted">
            <FiUser size={16} />
            <span>Personal Blog</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl transition hover:scale-105 active:scale-95"
        aria-label="Scroll to top"
      >
        <FiArrowUp size={22} />
      </button>
    </footer>
  )
}
