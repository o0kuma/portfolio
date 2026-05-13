'use client'

import { FiGithub, FiMail, FiArrowUp } from 'react-icons/fi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: '#060e1a' }}
    >
      {/* Wave SVG divider at top */}
      <div className="pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
          className="w-full block"
          style={{ height: '3.5rem', display: 'block' }}
        >
          <path
            d="M0,28 C240,56 480,0 720,28 C960,56 1200,8 1440,28 L1440,56 L0,56 Z"
            fill="rgba(34,211,238,0.06)"
          />
          <path
            d="M0,40 C360,16 720,52 1080,34 C1260,24 1380,44 1440,36 L1440,56 L0,56 Z"
            fill="rgba(56,189,248,0.04)"
          />
        </svg>
      </div>

      {/* Top hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

          {/* Copyright */}
          <p className="text-white/22 text-sm font-mono order-2 sm:order-1">
            © {currentYear} 오승일. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-5 order-1 sm:order-2">
            <a
              href="https://github.com/oikikomori/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-cyan-400 transition-colors duration-300"
              aria-label="GitHub"
            >
              <FiGithub size={17} />
            </a>
            <a
              href="mailto:c8c8c81828@gmail.com"
              className="text-white/25 hover:text-cyan-400 transition-colors duration-300"
              aria-label="Email"
            >
              <FiMail size={17} />
            </a>
          </div>

          {/* Scroll to top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-white/22 hover:text-cyan-400 transition-colors duration-300 text-xs font-mono order-3"
            aria-label="상단으로 이동"
          >
            <FiArrowUp size={13} />
            TOP
          </button>
        </div>
      </div>

      {/* Fixed scroll-to-top button */}
      <button
        type="button"
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #22d3ee, #34d399)',
          boxShadow: '0 4px 20px rgba(34,211,238,0.35)',
          zIndex: 40,
          cursor: 'pointer',
          border: 'none',
          transition: 'opacity 0.2s, transform 0.2s',
          color: '#0a1628',
        }}
        aria-label="상단으로 이동"
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        <FiArrowUp size={18} />
      </button>
    </footer>
  )
}
