import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import { cookies } from 'next/headers'
import { isAdminAuthorized, isAdminBearerAuthorized } from '@/lib/adminAuth'
import { createAdminSessionToken } from '@/lib/admin-session'

const cookiesMock = vi.mocked(cookies)

describe('admin auth helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    cookiesMock.mockReset()
  })

  it('accepts bearer ADMIN_API_TOKEN', () => {
    vi.stubEnv('ADMIN_API_TOKEN', 'secret-token')
    const request = new Request('http://localhost/api/posts', {
      headers: { Authorization: 'Bearer secret-token' },
    })

    expect(isAdminBearerAuthorized(request)).toBe(true)
  })

  it('accepts HTTP-only admin cookie session', async () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'test-session-secret')
    const token = await createAdminSessionToken()
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === 'admin_session' ? { name, value: token! } : undefined,
    } as Awaited<ReturnType<typeof cookies>>)

    const request = new Request('http://localhost/api/posts/1', { method: 'DELETE' })
    expect(await isAdminAuthorized(request)).toBe(true)
  })

  it('rejects unauthenticated delete requests', async () => {
    vi.stubEnv('ADMIN_API_TOKEN', 'secret-token')
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    } as Awaited<ReturnType<typeof cookies>>)

    const request = new Request('http://localhost/api/posts/1', { method: 'DELETE' })
    expect(await isAdminAuthorized(request)).toBe(false)
  })
})
