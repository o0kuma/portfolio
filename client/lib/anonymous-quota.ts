import { randomBytes, createHash } from 'crypto'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'portfolio_ai_quota_id'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const COOKIE_VALUE_PATTERN = /^aq_[a-f0-9]{32}$/
const QUOTA_SESSION_ID_PATTERN = /^anon_(?:ip|cookie)_[a-f0-9]{32}$/
const IP_VALUE_PATTERN = /^[a-zA-Z0-9:.%-]{1,128}$/

export interface AnonymousQuotaIdentity {
  sessionId: string
  cookieValue?: string
  shouldSetCookie: boolean
}

function getQuotaSalt(): string {
  return (
    process.env.AI_QUOTA_SALT ||
    process.env.NEXTAUTH_SECRET ||
    process.env.GEMINI_API_KEY ||
    process.env.DATABASE_URL ||
    'portfolio-ai-quota-v1'
  )
}

function hashQuotaIdentifier(value: string): string {
  return createHash('sha256')
    .update(`${getQuotaSalt()}:${value}`)
    .digest('hex')
    .slice(0, 32)
}

function shouldTrustProxyIpHeaders(): boolean {
  return process.env.AI_QUOTA_TRUST_PROXY_HEADERS === 'true'
}

function getCookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  for (const cookie of cookieHeader.split(';')) {
    const [rawName, ...rawValueParts] = cookie.trim().split('=')
    if (rawName !== name) continue

    const rawValue = rawValueParts.join('=')
    try {
      return decodeURIComponent(rawValue)
    } catch {
      return rawValue
    }
  }

  return null
}

function getForwardedIp(request: Request): string | null {
  const headerValue =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('true-client-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')

  const forwardedIp = headerValue?.split(',')[0]?.trim()
  if (!forwardedIp || !IP_VALUE_PATTERN.test(forwardedIp)) {
    return null
  }

  return forwardedIp
}

function createCookieValue(): string {
  return `aq_${randomBytes(16).toString('hex')}`
}

export function isAnonymousQuotaSessionId(value: string | null): value is string {
  return Boolean(value && QUOTA_SESSION_ID_PATTERN.test(value))
}

export function getAnonymousQuotaIdentity(request: Request): AnonymousQuotaIdentity {
  const existingCookieValue = getCookieValue(request, COOKIE_NAME)
  const hasValidCookie = Boolean(existingCookieValue && COOKIE_VALUE_PATTERN.test(existingCookieValue))
  if (hasValidCookie) {
    const cookieValue = existingCookieValue as string
    return {
      sessionId: `anon_cookie_${hashQuotaIdentifier(cookieValue)}`,
      cookieValue,
      shouldSetCookie: false
    }
  }

  if (shouldTrustProxyIpHeaders()) {
    const forwardedIp = getForwardedIp(request)
    if (forwardedIp) {
      return {
        sessionId: `anon_ip_${hashQuotaIdentifier(forwardedIp)}`,
        shouldSetCookie: false
      }
    }
  }

  const cookieValue = createCookieValue()

  return {
    sessionId: `anon_cookie_${hashQuotaIdentifier(cookieValue)}`,
    cookieValue,
    shouldSetCookie: true
  }
}

export function applyAnonymousQuotaCookie(
  response: NextResponse,
  identity: AnonymousQuotaIdentity
): NextResponse {
  if (identity.shouldSetCookie && identity.cookieValue) {
    response.cookies.set(COOKIE_NAME, identity.cookieValue, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS
    })
  }

  return response
}
