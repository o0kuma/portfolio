'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const light = savedTheme === 'light'
    setIsDark(!light)
    if (light) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggle = () => {
    if (isAnimating) return
    setIsAnimating(true)
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      // Restore color-theme data-theme if previously set
      const colorTheme = localStorage.getItem('color-theme')
      if (colorTheme && colorTheme !== 'dark' && colorTheme !== 'light-mode') {
        document.documentElement.setAttribute('data-theme', colorTheme)
      }
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
    setTimeout(() => setIsAnimating(false), 600)
  }

  return (
    <>
      <style>{`
        @keyframes theme-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ray-pulse {
          0%, 100% { opacity: 1; transform-origin: 18px 18px; }
          50%       { opacity: 0.6; }
        }
        .theme-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }
        .theme-icon-wrap.spinning svg {
          animation: theme-spin 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sun-ray {
          animation: ray-pulse 2.5s ease-in-out infinite;
        }
        .sun-ray:nth-child(2) { animation-delay: 0.3s; }
        .sun-ray:nth-child(3) { animation-delay: 0.6s; }
        .sun-ray:nth-child(4) { animation-delay: 0.9s; }
        .sun-ray:nth-child(5) { animation-delay: 1.2s; }
        .sun-ray:nth-child(6) { animation-delay: 1.5s; }
        .sun-ray:nth-child(7) { animation-delay: 1.8s; }
        .sun-ray:nth-child(8) { animation-delay: 2.1s; }
      `}</style>

      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="p-2 transition-colors rounded-lg text-neutral-500 hover:text-neutral-100"
      >
        <div className={`theme-icon-wrap${isAnimating ? ' spinning' : ''}`}>
          {isDark ? (
            /* Sun icon */
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Rays */}
              {([0, 45, 90, 135, 180, 225, 270, 315] as number[]).map((angle) => (
                <line
                  key={angle}
                  className="sun-ray"
                  x1="18"
                  y1="4"
                  x2="18"
                  y2="8"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ transform: `rotate(${angle}deg)`, transformOrigin: '18px 18px' }}
                />
              ))}
              {/* Core */}
              <circle cx="18" cy="18" r="7" fill="#f59e0b" />
            </svg>
          ) : (
            /* Moon icon — crescent via SVG mask */
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <mask id="crescent-mask">
                  <rect width="36" height="36" fill="white" />
                  <circle cx="23" cy="13" r="9" fill="black" />
                </mask>
              </defs>
              <circle cx="18" cy="18" r="10" fill="#e2e8f0" mask="url(#crescent-mask)" />
              {/* Tiny stars */}
              <circle cx="27" cy="8"  r="1.2" fill="#e2e8f0" opacity="0.8" />
              <circle cx="30" cy="16" r="0.9" fill="#e2e8f0" opacity="0.6" />
              <circle cx="24" cy="26" r="0.8" fill="#e2e8f0" opacity="0.5" />
            </svg>
          )}
        </div>
      </button>
    </>
  )
}
