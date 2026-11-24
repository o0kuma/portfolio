/** Canonical site URL — production default kuuuma.com */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return 'https://kuuuma.com'
}

/**
 * Server/runtime gate for /portfolio. Public by default; set
 * PORTFOLIO_DISABLED=true (server env, no rebuild needed) to hide it again.
 */
export function isPortfolioPublic(): boolean {
  return process.env.PORTFOLIO_DISABLED !== 'true'
}

/**
 * Menu link visibility — NEXT_PUBLIC_* is inlined at build time.
 * Set NEXT_PUBLIC_PORTFOLIO_DISABLED=true to hide the link.
 */
export const PORTFOLIO_PUBLIC = process.env.NEXT_PUBLIC_PORTFOLIO_DISABLED !== 'true'

export const SITE_NAME = 'kuuuma'
export const SITE_AUTHOR = 'okuma'
export const SITE_GITHUB = 'https://github.com/oikikomori'
export const SITE_EMAIL = 'c8c8c81828@gmail.com'
export const OG_IMAGE_PATH = '/images/placeholder.svg'
