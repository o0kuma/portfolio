import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/adminAuth', () => ({
  isAdminAuthenticated: vi.fn(),
}))
vi.mock('@/lib/neon-server', () => ({
  dbQuery: vi.fn(),
}))

import { isAdminAuthenticated } from '@/lib/adminAuth'
import { dbQuery } from '@/lib/neon-server'
import { GET } from '@/app/api/admin/trends/route'

const isAdminAuthenticatedMock = vi.mocked(isAdminAuthenticated)
const dbQueryMock = vi.mocked(dbQuery)

describe('GET /api/admin/trends', () => {
  beforeEach(() => {
    isAdminAuthenticatedMock.mockReset()
    dbQueryMock.mockReset()
  })

  it('rejects unauthenticated requests without querying the database', async () => {
    isAdminAuthenticatedMock.mockResolvedValue(false)

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
    expect(dbQueryMock).not.toHaveBeenCalled()
  })

  it('returns per-game and AI usage series for an authenticated admin', async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true)
    dbQueryMock
      .mockResolvedValueOnce({ rows: [{ day: '2026-07-10', count: '3' }] } as any) // tetris
      .mockResolvedValueOnce({ rows: [{ day: '2026-07-10', count: '1' }] } as any) // survive
      .mockResolvedValueOnce({ rows: [{ day: '2026-07-10', count: '0' }] } as any) // tower
      .mockResolvedValueOnce({ rows: [{ day: '2026-07-10', count: '12' }] } as any) // ai usage

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.games.tetris).toEqual([{ day: '2026-07-10', count: 3 }])
    expect(body.games.survive).toEqual([{ day: '2026-07-10', count: 1 }])
    expect(body.games.towerDefense).toEqual([{ day: '2026-07-10', count: 0 }])
    expect(body.aiUsage).toEqual([{ day: '2026-07-10', count: 12 }])
  })

  it('degrades a single failed query to an empty series instead of failing the whole response', async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true)
    dbQueryMock
      .mockRejectedValueOnce(new Error('DATABASE_URL not set')) // tetris fails
      .mockResolvedValueOnce({ rows: [] } as any) // survive
      .mockResolvedValueOnce({ rows: [] } as any) // tower
      .mockResolvedValueOnce({ rows: [] } as any) // ai usage

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.games.tetris).toEqual([])
  })

  it('returns a 500 with a generic message if something throws outside the settled queries', async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true)
    dbQueryMock.mockImplementation(() => {
      throw new Error('unexpected')
    })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
  })
})
