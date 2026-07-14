'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiGithub, FiMail, FiArrowUp, FiBook, FiCode, FiUser } from 'react-icons/fi'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'
import { POST_CATEGORIES } from '@/lib/post-categories'
import { PORTFOLIO_PUBLIC, SITE_AUTHOR, SITE_EMAIL, SITE_GITHUB } from '@/lib/site'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const VisitorCounter = dynamic(() => import('@/components/VisitorCounter'), {
  ssr: false,
})

export default function BlogFooter() {
  const { locale, t, toggleLocale } = useLanguage()
  const currentYear = new Date().getFullYear()
  const reduced = usePrefersReducedMotion()
  const footerRef = useRef<HTMLElement>(null)

  // 0 as the footer's top edge first touches the viewport bottom (deep space),
  // 1 once it's fully scrolled into view (atmosphere/horizon) — reads as
  // "descending toward Earth" as you scroll into the footer.
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'start start'],
  })
  const atmosphereOpacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const limbOpacity = useTransform(scrollYProgress, [0.3, 1], [0, 1])

  const socialLinks = [
    { icon: FiGithub, href: SITE_GITHUB, label: 'GitHub' },
    { icon: FiMail, href: `mailto:${SITE_EMAIL}`, label: 'Email' },
  ]

  const quickLinks = [
    { name: t.blogFooter.links.home, href: '/' },
    { name: t.blogFooter.links.posts, href: '/posts' },
    ...(PORTFOLIO_PUBLIC
      ? [{ name: t.blogFooter.links.portfolio, href: '/portfolio' }]
      : []),
    { name: t.blogFooter.links.privacy, href: '/privacy' },
    { name: t.blogFooter.links.terms, href: '/terms' },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer ref={footerRef} className="relative overflow-hidden border-t border-border bg-surfaceElevated/90 text-textPrimary backdrop-blur-sm">
      {/* Atmosphere approach — dark-mode only, crossfades in as the footer
          scrolls into view so the page reads as descending from deep space
          toward Earth's horizon by the time you reach the bottom. */}
      <motion.div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          opacity: reduced ? 1 : atmosphereOpacity,
          backgroundImage:
            'linear-gradient(to bottom, transparent 0%, rgba(10,22,40,0.7) 40%, rgba(37,72,120,0.75) 72%, rgba(251,146,60,0.32) 100%)',
        }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden dark:block"
        style={{
          opacity: reduced ? 1 : limbOpacity,
          height: '60%',
          backgroundImage:
            'radial-gradient(ellipse 90% 70% at 50% 120%, rgba(129,180,255,0.45) 0%, rgba(96,165,250,0.18) 35%, transparent 65%)',
        }}
        aria-hidden
      />
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
                  {t.blogFooter.brand}
                </h3>
              </Link>
              <p className="mb-6 leading-relaxed text-textMuted">{t.blogFooter.description}</p>

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
                {t.blogFooter.quickLinks}
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
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
                {t.blogFooter.categories}
              </h4>
              <ul className="space-y-3">
                {POST_CATEGORIES.filter((c) => c.id !== 'general').map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/posts?category=${cat.id}`}
                      className="group flex items-center gap-2 text-textMuted transition-colors hover:text-textPrimary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      {locale === 'ko' ? cat.ko : cat.en}
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
            {interpolate(t.blogFooter.copyright, { year: currentYear, author: SITE_AUTHOR })}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLocale}
              className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-textMuted hover:text-textPrimary"
            >
              {t.blogFooter.langToggle}
            </button>
            <div className="flex items-center gap-2 text-sm text-textMuted">
              <FiUser size={16} />
              <span>{t.blogFooter.personalBlog}</span>
            </div>
            <VisitorCounter />
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
