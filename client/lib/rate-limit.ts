/**
 * In-memory rate limiting for `proxy.ts` (Next.js middleware equivalent).
 *
 * Vercel's Edge/serverless runtime may reuse a "warm" isolate across
 * consecutive requests for a short while, but there is NO guarantee of a
 * single shared instance across all requests/regions — this is a best-effort
 * limiter, not a distributed one. That's an accepted trade-off: the project
 * has no Redis/Upstash infra today, and adding one is out of scope for a
 * personal-portfolio free-tier deployment. State is kept on `globalThis` so
 * it survives module re-evaluation within the same warm instance/dev reload.
 */

interface FixedWindowEntry {
  count: number
  resetAt: number
}

interface RateLimitGlobals {
  __rlBuckets?: Map<string, FixedWindowEntry>
  __rlBannedIps?: Map<string, number>
  __rlLastSweep?: number
}

const g = globalThis as unknown as RateLimitGlobals

// Safety valve so a huge burst of unique IPs (e.g. a botnet) can't grow the
// in-memory map without bound on a long-lived warm instance.
const MAX_TRACKED_KEYS = 8000
const SWEEP_INTERVAL_MS = 30_000

function getBuckets(): Map<string, FixedWindowEntry> {
  if (!g.__rlBuckets) g.__rlBuckets = new Map()
  return g.__rlBuckets
}

function getBannedIps(): Map<string, number> {
  if (!g.__rlBannedIps) g.__rlBannedIps = new Map()
  return g.__rlBannedIps
}

function sweepExpired(now: number): void {
  if (g.__rlLastSweep && now - g.__rlLastSweep < SWEEP_INTERVAL_MS) return
  g.__rlLastSweep = now

  const buckets = getBuckets()
  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key)
  }
  if (buckets.size > MAX_TRACKED_KEYS) {
    // Crude but effective for a free-tier personal site: drop everything and
    // let legitimate clients re-establish their window on the next request.
    buckets.clear()
  }

  const banned = getBannedIps()
  for (const [ip, expiresAt] of banned) {
    if (now >= expiresAt) banned.delete(ip)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  retryAfterSeconds: number
}

/**
 * Fixed-window counter. Not as smooth as a sliding window/token bucket, but
 * simple, cheap, and good enough for "obviously excessive" traffic detection.
 */
export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweepExpired(now)

  const buckets = getBuckets()
  const entry = buckets.get(key)

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, limit, retryAfterSeconds: 0 }
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, limit, retryAfterSeconds: 0 }
}

/**
 * Temporary IP ban store — used as defense-in-depth after a single request
 * that scans for a sensitive path (`/wp-admin`, `/.env`, ...). One hit is
 * already a strong enough signal that we don't need to wait for a rate
 * threshold before blocking the rest of that IP's scan attempts.
 */
export function banIpTemporarily(ip: string, durationMs: number): void {
  if (!ip || ip === 'unknown') return
  getBannedIps().set(ip, Date.now() + durationMs)
}

export function isIpTemporarilyBanned(ip: string): boolean {
  if (!ip || ip === 'unknown') return false
  const banned = getBannedIps()
  const expiresAt = banned.get(ip)
  if (!expiresAt) return false
  if (Date.now() >= expiresAt) {
    banned.delete(ip)
    return false
  }
  return true
}

/**
 * High-frequency, site-owned polling endpoints (layout LiveCursors, RPG
 * presence). They legitimately send ~1 req/s per tab and must not consume the
 * per-IP proxy budget meant for scrapers — otherwise CN visitors (5/10s) and
 * /rpg (LiveCursors + presence ≈ 20/10s) hit 429 while browsing normally.
 */
const RATE_LIMIT_EXEMPT_PATHS = new Set(['/api/cursors', '/api/rpg-presence'])

export function isRateLimitExemptPath(pathname: string): boolean {
  return RATE_LIMIT_EXEMPT_PATHS.has(pathname)
}

/**
 * In-app router fetches: `<Link>` prefetches and client-side navigations.
 * A single home page view fires a dozen or more prefetches in the background,
 * one per visible link segment. Counting them against the general budget
 * meant an ordinary visitor could exhaust it before clicking anything, and
 * the click then got a plain-text 429 page.
 *
 * Next.js strips its own `rsc` / `next-router-prefetch` headers and the
 * `_rsc` query before the proxy runs, so those can't be used here. The
 * `next-url` header (current page path, sent by the App Router on every RSC
 * fetch) survives and is absent on ordinary document loads and API calls.
 *
 * These get their own, larger bucket instead of a free pass, so faking the
 * header doesn't let a scraper bypass limiting.
 */
export function isClientRouterRequest(pathname: string, headers: Headers): boolean {
  if (pathname.startsWith('/api/')) return false
  return headers.has('next-url')
}
