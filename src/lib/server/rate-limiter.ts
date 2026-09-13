export interface RateLimitOptions {
  /** Time window in milliseconds (default: 60,000ms = 1 minute) */
  windowMs?: number
  /** Maximum number of requests allowed within windowMs (default: 20) */
  maxRequests?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  totalLimit: number
  resetTimeMs: number
  retryAfterSeconds?: number
}

interface RateLimitRecord {
  timestamps: number[]
}

const memoryStore = new Map<string, RateLimitRecord>()

// Cleanup interval to avoid memory growth over time
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000
let lastCleanup = Date.now()

function cleanupExpiredRecords(now: number, maxAgeMs: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  for (const [key, record] of memoryStore.entries()) {
    const validTimestamps = record.timestamps.filter((ts) => now - ts < maxAgeMs)
    if (validTimestamps.length === 0) {
      memoryStore.delete(key)
    } else {
      record.timestamps = validTimestamps
    }
  }
}

/**
 * Check and record a request against sliding window rate limit.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000
  const maxRequests = options.maxRequests ?? 20
  const now = Date.now()

  cleanupExpiredRecords(now, windowMs)

  let record = memoryStore.get(key)
  if (!record) {
    record = { timestamps: [] }
    memoryStore.set(key, record)
  }

  // Filter out timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0]
    const resetTimeMs = oldest + windowMs
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000))

    return {
      allowed: false,
      remaining: 0,
      totalLimit: maxRequests,
      resetTimeMs,
      retryAfterSeconds,
    }
  }

  // Record this hit
  record.timestamps.push(now)
  const remaining = maxRequests - record.timestamps.length
  const resetTimeMs = (record.timestamps[0] ?? now) + windowMs

  return {
    allowed: true,
    remaining,
    totalLimit: maxRequests,
    resetTimeMs,
  }
}

/**
 * Reset memory store (useful for testing and administrative resets)
 */
export function resetRateLimits(): void {
  memoryStore.clear()
  lastCleanup = Date.now()
}
