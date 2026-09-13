import { describe, it, expect } from 'vitest'
import manifest from './manifest'

describe('PWA manifest', () => {
  it('returns valid PWA manifest configuration', () => {
    const config = manifest()
    expect(config.name).toContain('SCIDAS')
    expect(config.short_name).toBe('SCIDAS')
    expect(config.display).toBe('standalone')
    expect(config.start_url).toBe('/')
    expect(config.icons).toBeDefined()
    expect(config.icons?.length).toBeGreaterThan(0)
  })
})
