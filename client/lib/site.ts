/** Canonical site URL — production default kuuuma.com */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return 'https://kuuuma.com'
}

/**
 * Server/runtime gate for /portfolio. Public by default; opt out with PORTFOLIO_DISABLED=true
 * or legacy PORTFOLIO_ENABLED=false / NEXT_PUBLIC_PORTFOLIO_DISABLED=true.
 */
export function isPortfolioPublic(): boolean {
  if (process.env.PORTFOLIO_DISABLED === 'true') return false
  if (process.env.NEXT_PUBLIC_PORTFOLIO_DISABLED === 'true') return false
  if (process.env.PORTFOLIO_ENABLED === 'false') return false
  return true
}

/**
 * Client nav visibility — NEXT_PUBLIC_* inlined at build time.
 * Hide nav with NEXT_PUBLIC_PORTFOLIO_DISABLED=true (or legacy NEXT_PUBLIC_PORTFOLIO_ENABLED=false).
 */
export const PORTFOLIO_PUBLIC =
  process.env.NEXT_PUBLIC_PORTFOLIO_DISABLED !== 'true' &&
  process.env.NEXT_PUBLIC_PORTFOLIO_ENABLED !== 'false'

export const SITE_NAME = 'kuuuma.com'
export const SITE_AUTHOR = '오승일'
export const SITE_GITHUB = 'https://github.com/oikikomori'
export const SITE_EMAIL = 'c8c8c81828@gmail.com'
export const OG_IMAGE_PATH = '/images/placeholder.svg'
