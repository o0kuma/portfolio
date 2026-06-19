import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdminSessionToken, verifyAdminSessionToken } from '@/lib/admin-session'

describe('admin-session', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, ADMIN_SESSION_SECRET: 'test-secret-key' }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('rejects legacy forgeable authenticated literal', async () => {
    await expect(verifyAdminSessionToken('authenticated')).resolves.toBe(false)
  })

  it('issues and verifies a signed session token', async () => {
    const token = await createAdminSessionToken()
    expect(token).toBeTruthy()
    await expect(verifyAdminSessionToken(token)).resolves.toBe(true)
  })

  it('rejects tampered tokens', async () => {
    const token = await createAdminSessionToken()
    expect(token).toBeTruthy()
    const tampered = `${token}x`
    await expect(verifyAdminSessionToken(tampered)).resolves.toBe(false)
  })

  it('rejects expired tokens', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    const token = await createAdminSessionToken()
    vi.spyOn(Date, 'now').mockReturnValue(1_000 + 8 * 24 * 60 * 60 * 1000)
    await expect(verifyAdminSessionToken(token)).resolves.toBe(false)
  })
})
