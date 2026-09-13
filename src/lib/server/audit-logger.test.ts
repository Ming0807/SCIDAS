import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import {
  sanitizeAuditData,
  getAuditMetadataFromHeaders,
  logAudit,
  logExportAudit,
} from './audit-logger'

describe('audit-logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sanitizeAuditData', () => {
    it('returns null for null or undefined data', () => {
      expect(sanitizeAuditData(null)).toBeNull()
      expect(sanitizeAuditData(undefined)).toBeNull()
    })

    it('masks sensitive fields and preserves non-sensitive fields', () => {
      const input = {
        name: 'John Doe',
        citizen_id: '1234567890123',
        password: 'supersecretpassword',
        pin: '1234',
        nested: {
          token: 'jwt-token-secret-1234',
          email: 'john@example.com',
        },
      }

      const result = sanitizeAuditData(input) as Record<string, unknown>

      expect(result.name).toBe('John Doe')
      expect(result.citizen_id).toBe('***0123')
      expect(result.password).toBe('***word')
      expect(result.pin).toBe('***')

      const nested = result.nested as Record<string, unknown>
      expect(nested.token).toBe('***1234')
      expect(nested.email).toBe('john@example.com')
    })

    it('handles arrays properly', () => {
      const input = [
        { citizen_id: '1234567890123' },
        { name: 'Alice' },
      ]

      const result = sanitizeAuditData(input) as Array<Record<string, unknown>>
      expect(result[0].citizen_id).toBe('***0123')
      expect(result[1].name).toBe('Alice')
    })
  })

  describe('getAuditMetadataFromHeaders', () => {
    it('extracts IP from x-forwarded-for first IP and user-agent', async () => {
      vi.mocked(headers).mockResolvedValueOnce({
        get: (key: string) => {
          if (key === 'x-forwarded-for') return '203.0.113.195, 70.41.3.18'
          if (key === 'user-agent') return 'Mozilla/5.0 TestBrowser'
          return null
        },
      } as unknown as Awaited<ReturnType<typeof headers>>)

      const meta = await getAuditMetadataFromHeaders()
      expect(meta.ipAddress).toBe('203.0.113.195')
      expect(meta.userAgent).toBe('Mozilla/5.0 TestBrowser')
    })

    it('falls back to x-real-ip if x-forwarded-for is missing', async () => {
      vi.mocked(headers).mockResolvedValueOnce({
        get: (key: string) => {
          if (key === 'x-real-ip') return '198.51.100.1'
          return null
        },
      } as unknown as Awaited<ReturnType<typeof headers>>)

      const meta = await getAuditMetadataFromHeaders()
      expect(meta.ipAddress).toBe('198.51.100.1')
      expect(meta.userAgent).toBeNull()
    })

    it('returns nulls safely if headers() throws', async () => {
      vi.mocked(headers).mockRejectedValueOnce(new Error('Outside request context'))

      const meta = await getAuditMetadataFromHeaders()
      expect(meta.ipAddress).toBeNull()
      expect(meta.userAgent).toBeNull()
    })
  })

  describe('logAudit', () => {
    it('successfully inserts an audit record', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'audit-log-uuid-1' },
            error: null,
          }),
        }),
      })

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await logAudit({
        action: 'UPDATE',
        tableName: 'students',
        recordId: 'student-1',
        schoolId: 'sch-1',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'TestUA',
        newData: { status: 'active', citizen_id: '1234567890123' },
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('audit-log-uuid-1')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          table_name: 'students',
          record_id: 'student-1',
          school_id: 'sch-1',
          user_id: 'user-1',
          ip_address: '127.0.0.1',
          new_data: expect.objectContaining({
            status: 'active',
            citizen_id: '***0123',
          }),
        })
      )
    })

    it('handles insert failure gracefully without throwing', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'relation audit_logs does not exist' },
          }),
        }),
      })

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await logAudit({
        action: 'DELETE',
        tableName: 'students',
        recordId: 'student-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('relation audit_logs does not exist')
    })
  })

  describe('logExportAudit', () => {
    it('creates an EXPORT audit record with report metadata', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'audit-log-export-1' },
            error: null,
          }),
        }),
      })

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await logExportAudit({
        schoolId: 'sch-1',
        userId: 'teacher-1',
        reportType: 'behavior_summary',
        fileName: 'report-123.pdf',
        format: 'pdf',
        ipAddress: '10.0.0.1',
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('audit-log-export-1')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EXPORT',
          table_name: 'reports',
          school_id: 'sch-1',
          user_id: 'teacher-1',
          new_data: expect.objectContaining({
            reportType: 'behavior_summary',
            fileName: 'report-123.pdf',
            format: 'pdf',
          }),
        })
      )
    })
  })
})
