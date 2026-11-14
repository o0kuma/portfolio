/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        surfaceElevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        textPrimary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        textMuted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        accentMuted: 'rgb(var(--color-accent-muted) / <alpha-value>)',
        // Renewal design tokens (dark only). Pages use these names instead of
        // raw colours so one change here restyles the whole site.
        night: '#030014',
        panel: '#0F0D24',
        'panel-2': '#1C1938',
        line: 'rgba(255,255,255,0.08)',
        'line-strong': 'rgba(255,255,255,0.16)',
        fg: '#F2F2F5',
        'fg-muted': '#A3A3B5',
        'fg-subtle': '#7C7C92',
        star: '#F2C46D',
        danger: '#F07178',
        ok: '#7FD1A8',
      },
      maxWidth: {
        reading: '680px',
        list: '960px',
        wide: '1120px',
      },
      fontFamily: {
        // Pretendard covers Hangul and Latin in one family, so Korean and
        // English in the same line no longer mix two different typefaces.
        sans: ['"Pretendard Variable"', 'Pretendard', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        // Headings use the same family as body text; the serif is reserved
        // for the "kuuuma" wordmark (font-logo).
        display: ['"Pretendard Variable"', 'Pretendard', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        logo: ['var(--font-display)', 'Georgia', 'serif'],
        // Fira Code has no Hangul; fall back to Pretendard for Korean glyphs.
        mono: ['var(--font-mono)', 'Fira Code', '"Pretendard Variable"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        blink: 'blink 1s step-end infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spin 12s linear infinite reverse',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
