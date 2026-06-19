const SESSION_VERSION = 'v1'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function getSessionSecret(): string | null {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_API_TOKEN?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    null
  )
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    const binary = atob(padded + pad)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return new Uint8Array(sig)
}

/** Issue a signed admin session token (Edge + Node compatible). */
export async function createAdminSessionToken(): Promise<string | null> {
  const secret = getSessionSecret()
  if (!secret) return null
  const exp = Date.now() + MAX_AGE_MS
  const payload = `${SESSION_VERSION}.${exp}`
  const sig = await hmacSha256(secret, payload)
  return `${payload}.${toBase64Url(sig)}`
}

/** Verify signed admin session; rejects legacy forgeable `authenticated` literal. */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || token === 'authenticated') return false
  const secret = getSessionSecret()
  if (!secret) return false

  const lastDot = token.lastIndexOf('.')
  if (lastDot <= 0) return false

  const payload = token.slice(0, lastDot)
  const sigBytes = fromBase64Url(token.slice(lastDot + 1))
  if (!sigBytes) return false

  const expected = await hmacSha256(secret, payload)
  if (!timingSafeEqual(sigBytes, expected)) return false

  const [version, expRaw] = payload.split('.')
  if (version !== SESSION_VERSION) return false

  const exp = Number(expRaw)
  return Number.isFinite(exp) && exp > Date.now()
}
