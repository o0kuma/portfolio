/** Canonical site URL — production default kuuuma.com */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return 'https://kuuuma.com'
}

/**
 * Server/runtime gate for /portfolio (works on Vercel Preview without rebuild).
 * Set PORTFOLIO_ENABLED=true (server-only) and/or NEXT_PUBLIC_PORTFOLIO_ENABLED=true.
 */
export function isPortfolioPublic(): boolean {
  if (process.env.PORTFOLIO_ENABLED === 'true') return true
  if (process.env.NEXT_PUBLIC_PORTFOLIO_ENABLED === 'true') return true
  return false
}

/**
 * Client nav visibility — NEXT_PUBLIC_* is inlined at build time; use with PORTFOLIO_ENABLED on Preview for page access.
 */
export const PORTFOLIO_PUBLIC = process.env.NEXT_PUBLIC_PORTFOLIO_ENABLED === 'true'

export const SITE_NAME = 'kuuuma.com'
export const SITE_AUTHOR = '오승일'
export const SITE_GITHUB = 'https://github.com/oikikomori'
export const SITE_EMAIL = 'c8c8c81828@gmail.com'
export const OG_IMAGE_PATH = '/images/placeholder.svg'
