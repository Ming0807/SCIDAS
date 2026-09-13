import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/utils/supabase/server'
import { GET, HEAD } from './route'

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns healthy status when database is reachable', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
    })

    vi.mocked(createClient).mockResolvedValueOnce({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>)

    const response = await GET()
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.status).toBe('ok')
    expect(json.checks.database.status).toBe('healthy')
    expect(typeof json.checks.database.latencyMs).toBe('number')
    expect(json.checks.memory.status).toBe('healthy')
    expect(typeof json.checks.memory.heapUsedMb).toBe('number')
    expect(typeof json.uptimeSeconds).toBe('number')
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate')
  })

  it('returns degraded status when database encounters connection error', async () => {
    vi.mocked(createClient).mockRejectedValueOnce(new Error('fetch failed: connection refused'))

    const response = await GET()
    expect(response.status).toBe(503)

    const json = await response.json()
    expect(json.status).toBe('unhealthy')
    expect(json.checks.database.status).toBe('unhealthy')
    expect(json.checks.database.error).toContain('fetch failed')
  })
})

describe('HEAD /api/health', () => {
  it('returns 200 with no-cache headers and empty body', async () => {
    const response = await HEAD()
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate')
    const text = await response.text()
    expect(text).toBe('')
  })
})
