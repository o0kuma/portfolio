import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSessionToken } from '@/lib/admin-session'
import {
  detectObviousBot,
  isAuthorizedCronRequest,
  isSensitiveScanPath,
  isVercelCronUserAgent,
  isWhitelistedCrawler,
} from '@/lib/bot-detection'
import { getClientCountry, getClientIp } from '@/lib/request-geo'
import {
  banIpTemporarily,
  consumeRateLimit,
  isIpTemporarilyBanned,
  isRateLimitExemptPath,
  isClientRouterRequest,
} from '@/lib/rate-limit'

// ---------------------------------------------------------------------------
// Bot / scraper / rate-limit policy — runs before everything else, site-wide.
// See client/lib/bot-detection.ts and client/lib/rate-limit.ts for the
// underlying heuristics/store. Kept intentionally simple (in-memory, best
// effort) — see rate-limit.ts header comment for why.
// ---------------------------------------------------------------------------

/** One hit on a sensitive-path scan (`/wp-admin`, `/.env`, ...) bans the IP for this long. */
const SENSITIVE_PATH_BAN_MS = 10 * 60 * 1000 // 10 minutes

/**
 * General traffic budget — generous for a real visitor, tight for a script.
 * A single page view here already fires ~10 API calls (posts, visitors,
 * vitals, leaderboards), so 20/10s blocked people clicking through two pages.
 */
const GENERAL_RATE_LIMIT = 60
const GENERAL_RATE_WINDOW_MS = 10 * 1000 // 60 req / 10s per IP

/**
 * China-sourced IPs get a much stricter budget even when traffic doesn't
 * otherwise look like an obvious bot. Legitimate CN visitors still get
 * through as long as they stay under this (still human-plausible) threshold.
 */
const CN_RATE_LIMIT = 5
const CN_RATE_WINDOW_MS = 10 * 1000 // 5 req / 10s per IP
const STRICT_COUNTRIES = new Set(['CN'])

/**
 * Separate budget for in-app router fetches (link prefetches and client-side
 * navigations) — see isClientRouterRequest(). Sized so one page view plus a
 * few quick navigations fits comfortably.
 */
const ROUTER_RATE_LIMIT = 100
const CN_ROUTER_RATE_LIMIT = 30
const ROUTER_RATE_WINDOW_MS = 10 * 1000

function logBlock(reason: string, details: Record<string, unknown>): void {
  console.warn(`[proxy] blocked reason=${reason}`, JSON.stringify(details))
}

function textResponse(body: string, status: number, extraHeaders?: Record<string, string>): NextResponse {
  return new NextResponse(body, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', ...extraHeaders },
  })
}

/**
 * Returns a blocking NextResponse if this request should be rejected as an
 * obvious bot/scanner or for exceeding its rate-limit budget, or `null` if
 * the request may proceed.
 */
function applyBotAndRateLimitPolicy(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const headers = request.headers
  const userAgent = headers.get('user-agent') ?? ''
  const ip = getClientIp(headers)

  // Trusted internal callers (Vercel Cron, or any caller presenting the
  // correct CRON_SECRET bearer token for /api/cron/*) bypass this policy
  // entirely — see AGENTS.md for the cron endpoints this project runs.
  const isTrustedInternalCall =
    isVercelCronUserAgent(userAgent) || isAuthorizedCronRequest(pathname, headers.get('authorization'))
  if (isTrustedInternalCall) return null

  // Already flagged for scanning a sensitive path earlier — keep blocking.
  if (isIpTemporarilyBanned(ip)) {
    logBlock('ip-banned', { ip, pathname })
    return textResponse('Forbidden', 403)
  }

  // Scanning for wp-admin/.env/.git/phpmyadmin/etc. — block immediately and
  // keep blocking this IP for a while, regardless of what it requests next.
  if (isSensitiveScanPath(pathname)) {
    banIpTemporarily(ip, SENSITIVE_PATH_BAN_MS)
    logBlock('sensitive-path-scan', { ip, pathname, userAgent: userAgent.slice(0, 200) })
    return textResponse('Forbidden', 403)
  }

  // Official search-engine / social-preview crawlers skip bot-signature
  // checks AND rate limiting entirely.
  if (isWhitelistedCrawler(userAgent)) return null

  const botReason = detectObviousBot({
    userAgent,
    accept: headers.get('accept'),
    acceptLanguage: headers.get('accept-language'),
  })
  if (botReason) {
    logBlock(botReason, { ip, pathname, userAgent: userAgent.slice(0, 200) })
    return textResponse('Forbidden', 403)
  }

  const country = getClientCountry(headers)
  const isStrict = Boolean(country && STRICT_COUNTRIES.has(country))
  const isRouterFetch = isClientRouterRequest(pathname, headers)
  const limit = isRouterFetch
    ? isStrict
      ? CN_ROUTER_RATE_LIMIT
      : ROUTER_RATE_LIMIT
    : isStrict
      ? CN_RATE_LIMIT
      : GENERAL_RATE_LIMIT
  const windowMs = isRouterFetch
    ? ROUTER_RATE_WINDOW_MS
    : isStrict
      ? CN_RATE_WINDOW_MS
      : GENERAL_RATE_WINDOW_MS
  const rateKey = `${isRouterFetch ? 'rt-' : ''}${isStrict ? 'cn' : 'gen'}:${ip}`

  // Layout/RPG polling — see isRateLimitExemptPath() for rationale.
  if (!isRateLimitExemptPath(pathname)) {
    const result = consumeRateLimit(rateKey, limit, windowMs)
    if (!result.allowed) {
      logBlock('rate-limit', { ip, pathname, country, limit, windowMs, isRouterFetch })
      return textResponse('Too Many Requests', 429, {
        'retry-after': String(result.retryAfterSeconds),
      })
    }
  }

  return null
}

export async function proxy(request: NextRequest) {
  const blocked = applyBotAndRateLimitPolicy(request)
  if (blocked) return blocked

  const { pathname } = request.nextUrl

  // Protect /admin routes (but not /admin/login or /api/admin/login)
  if (
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login' &&
    !pathname.startsWith('/api/admin/login')
  ) {
    const session = request.cookies.get('admin_session')
    const authenticated = await verifyAdminSessionToken(session?.value)
    if (!authenticated) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Run on (almost) everything — static build assets and common static file
  // extensions are excluded so real browsers' rapid asset loading never gets
  // counted against the rate-limit budget above.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|mjs|woff|woff2|ttf|map)$).*)',
  ],
}
