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
        // Scrapbook theme (light paper only).
        paper: '#FFFBF0',
        dot: '#E4DCC8',
        ink: '#141414',
        'ink-soft': '#555049',
        pen: '#2846C8',
        // One colour per menu: 글 / 레시피 / 맛집 / 게임
        'cat-post': '#FFD23F',
        'cat-recipe': '#9FE6C8',
        'cat-food': '#FF8A66',
        'cat-game': '#BFD6FF',
        // Older token names, remapped onto the paper theme.
        night: '#FFFBF0',
        panel: '#FFFFFF',
        'panel-2': '#F6F0E2',
        line: 'rgba(20,20,20,0.14)',
        'line-strong': '#141414',
        fg: '#141414',
        'fg-muted': '#555049',
        'fg-subtle': '#6E685E',
        star: '#2846C8',
        danger: '#C0362C',
        ok: '#1E7A52',
      },
      maxWidth: {
        reading: '720px',
        list: '960px',
        wide: '1120px',
      },
      boxShadow: {
        'ink-sm': '3px 3px 0 #141414',
        ink: '5px 5px 0 #141414',
        'ink-lg': '6px 6px 0 #141414',
      },
      fontFamily: {
        hand: ['var(--font-hand)', '"Nanum Pen Script"', 'cursive'],
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
