import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import type { Database, Json } from '@/types/database.types'

export type AuditAction = Database['public']['Enums']['audit_action']

export interface AuditLogInput {
  action: AuditAction
  tableName: string
  recordId?: string | null
  schoolId?: string | null
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
}

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'pin',
  'national_id',
  'citizen_id',
  'id_card',
  'identification_number',
])

/**
 * Recursively sanitize and mask sensitive data according to PDPA principles.
 */
export function sanitizeAuditData(data: unknown): Json | null {
  if (data === null || data === undefined) return null

  if (typeof data !== 'object') {
    return data as unknown as Json
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAuditData(item)) as unknown as Json
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_KEYS.has(lowerKey)) {
      if (typeof value === 'string' && value.length > 4) {
        sanitized[key] = `***${value.slice(-4)}`
      } else {
        sanitized[key] = '***'
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as unknown as Json
}

/**
 * Extract IP address and User-Agent from incoming Next.js request headers safely.
 */
export async function getAuditMetadataFromHeaders(): Promise<{
  ipAddress: string | null
  userAgent: string | null
}> {
  try {
    const headerList = await headers()
    const ip =
      headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerList.get('x-real-ip') ||
      null
    const ua = headerList.get('user-agent') || null
    return { ipAddress: ip, userAgent: ua }
  } catch {
    return { ipAddress: null, userAgent: null }
  }
}

/**
 * Insert an immutable audit record into audit_logs.
 */
export async function logAudit(input: AuditLogInput): Promise<{
  success: boolean
  id?: string
  error?: string
}> {
  try {
    const supabase = await createClient()

    let finalIp = input.ipAddress ?? null
    let finalUa = input.userAgent ?? null

    if (!finalIp || !finalUa) {
      const headerMeta = await getAuditMetadataFromHeaders()
      finalIp = finalIp ?? headerMeta.ipAddress
      finalUa = finalUa ?? headerMeta.userAgent
    }

    const rowToInsert: Database['public']['Tables']['audit_logs']['Insert'] = {
      action: input.action,
      table_name: input.tableName,
      record_id: input.recordId ?? null,
      school_id: input.schoolId ?? null,
      user_id: input.userId ?? null,
      ip_address: finalIp,
      user_agent: finalUa,
      old_data: input.oldData ? sanitizeAuditData(input.oldData) : null,
      new_data: input.newData ? sanitizeAuditData(input.newData) : null,
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(rowToInsert)
      .select('id')
      .single()

    if (error) {
      console.error('[audit-logger] Failed to insert audit log:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown audit log error'
    console.error('[audit-logger] Unexpected error:', message)
    return { success: false, error: message }
  }
}

/**
 * Helper to record export events (PDF, Excel reports)
 */
export async function logExportAudit(params: {
  schoolId?: string | null
  userId?: string | null
  reportType: string
  fileName: string
  format: string
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<{ success: boolean; id?: string; error?: string }> {
  return logAudit({
    action: 'EXPORT',
    tableName: 'reports',
    schoolId: params.schoolId,
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    newData: {
      reportType: params.reportType,
      fileName: params.fileName,
      format: params.format,
      timestamp: new Date().toISOString(),
    },
  })
}
