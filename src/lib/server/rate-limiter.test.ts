import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit, resetRateLimits } from './rate-limiter'

describe('rate-limiter', () => {
  beforeEach(() => {
    resetRateLimits()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests within limit and decrements remaining', () => {
    const opts = { maxRequests: 3, windowMs: 10_000 }
    const key = 'user:123'

    const r1 = checkRateLimit(key, opts)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = checkRateLimit(key, opts)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = checkRateLimit(key, opts)
    expect(r3.allowed).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it('blocks requests exceeding limit and provides retryAfterSeconds', () => {
    const opts = { maxRequests: 2, windowMs: 5_000 }
    const key = 'user:456'

    checkRateLimit(key, opts)
    checkRateLimit(key, opts)

    const blocked = checkRateLimit(key, opts)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfterSeconds).toBe(5)
  })

  it('allows requests again after window passes', () => {
    const opts = { maxRequests: 1, windowMs: 5_000 }
    const key = 'user:789'

    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(false)

    // Fast forward 5.1 seconds
    vi.advanceTimersByTime(5_100)

    const afterWindow = checkRateLimit(key, opts)
    expect(afterWindow.allowed).toBe(true)
    expect(afterWindow.remaining).toBe(0)
  })

  it('tracks different keys independently', () => {
    const opts = { maxRequests: 1, windowMs: 10_000 }

    expect(checkRateLimit('user:a', opts).allowed).toBe(true)
    expect(checkRateLimit('user:a', opts).allowed).toBe(false)

    expect(checkRateLimit('user:b', opts).allowed).toBe(true)
  })

  it('resets all limits via resetRateLimits()', () => {
    const opts = { maxRequests: 1, windowMs: 10_000 }
    checkRateLimit('user:reset', opts)
    expect(checkRateLimit('user:reset', opts).allowed).toBe(false)

    resetRateLimits()

    expect(checkRateLimit('user:reset', opts).allowed).toBe(true)
  })
})
