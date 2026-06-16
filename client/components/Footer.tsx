'use client'

import { FiGithub, FiMail, FiArrowUp } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { interpolate } from '@/lib/i18n'

export default function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-neutral-950 border-t border-neutral-800">
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-neutral-600 text-sm font-mono order-2 sm:order-1">
            {interpolate(t.footer.copyright, { year: currentYear })}
          </p>

          <div className="flex items-center gap-5 order-1 sm:order-2">
            <a
              href="https://github.com/oikikomori/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-200 transition-colors"
              aria-label="GitHub"
            >
              <FiGithub size={17} />
            </a>
            <a
              href="mailto:c8c8c81828@gmail.com"
              className="text-neutral-500 hover:text-neutral-200 transition-colors"
              aria-label="Email"
            >
              <FiMail size={17} />
            </a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-200 transition-colors text-xs font-mono order-3"
            aria-label={t.footer.scrollToTop}
          >
            <FiArrowUp size={13} />
            TOP
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100 transition-colors"
        aria-label="상단으로 이동"
      >
        <FiArrowUp size={18} />
      </button>
    </footer>
  )
}
