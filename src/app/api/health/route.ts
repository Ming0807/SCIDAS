import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptimeSeconds: number
  environment: string
  checks: {
    database: {
      status: 'healthy' | 'unhealthy'
      latencyMs: number
      error?: string
    }
    memory: {
      status: 'healthy' | 'warning'
      heapUsedMb: number
      heapTotalMb: number
      rssMb: number
    }
  }
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const startDb = Date.now()
  let dbStatus: 'healthy' | 'unhealthy' = 'healthy'
  let dbError: string | undefined

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('profiles')
      .select('id', { head: true, count: 'exact' })
      .limit(1)

    if (error && error.message.includes('fetch failed')) {
      dbStatus = 'unhealthy'
      dbError = error.message
    }
  } catch (err) {
    dbStatus = 'unhealthy'
    dbError = err instanceof Error ? err.message : 'Unknown database error'
  }

  const dbLatencyMs = Date.now() - startDb

  const mem = process.memoryUsage()
  const heapUsedMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100
  const heapTotalMb = Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
  const rssMb = Math.round((mem.rss / 1024 / 1024) * 100) / 100

  const memoryStatus: 'healthy' | 'warning' =
    heapUsedMb / heapTotalMb > 0.9 ? 'warning' : 'healthy'

  const overallStatus: 'ok' | 'degraded' | 'unhealthy' =
    dbStatus === 'unhealthy'
      ? 'unhealthy'
      : memoryStatus === 'warning'
        ? 'degraded'
        : 'ok'

  const responseBody: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        ...(dbError ? { error: dbError } : {}),
      },
      memory: {
        status: memoryStatus,
        heapUsedMb,
        heapTotalMb,
        rssMb,
      },
    },
  }

  return NextResponse.json(responseBody, {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

export async function HEAD(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
