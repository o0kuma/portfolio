/** Canonical site URL — production default kuuuma.com */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return 'https://kuuuma.com'
}

/** Set NEXT_PUBLIC_PORTFOLIO_ENABLED=true to expose /portfolio and nav links. */
export const PORTFOLIO_PUBLIC = process.env.NEXT_PUBLIC_PORTFOLIO_ENABLED === 'true'

export const SITE_NAME = 'kuuuma.com'
export const SITE_AUTHOR = '오승일'
export const SITE_GITHUB = 'https://github.com/oikikomori'
export const SITE_EMAIL = 'c8c8c81828@gmail.com'
export const OG_IMAGE_PATH = '/images/placeholder.svg'
