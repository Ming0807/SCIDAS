import type { Database, Json } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext } from "./current-user"

type PublicTables = Database["public"]["Tables"]
type ReportJobRow = PublicTables["report_jobs"]["Row"]
type ReportJobQueryRow = Pick<
  ReportJobRow,
  | "id"
  | "title"
  | "report_type"
  | "status"
  | "requested_at"
  | "completed_at"
  | "error_message"
  | "output_bucket"
  | "output_path"
  | "requested_by"
> & {
  profiles: { first_name: string | null; last_name: string | null } | null
}

export type ReportJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled"

export type ReportJobItem = {
  id: string
  title: string
  reportType: string
  status: ReportJobStatus
  requestedAt: string
  completedAt: string | null
  requestedByName: string | null
  errorMessage: string | null
  hasOutput: boolean
  downloadUrl: string | null
}

const knownReportTypeLabels: Record<string, string> = {
  student_summary: "รายงานสรุปนักเรียน",
  risk_report: "รายงานกลุ่มเสี่ยง",
  behavior_report: "รายงานพฤติกรรม",
  academic_report: "รายงานผลการเรียน",
  support_report: "รายงานการดูแลช่วยเหลือ",
  idp_report: "รายงานพัฒนารายบุคคล",
  attendance_report: "รายงานการมาเรียน",
  admin_summary: "รายงานสำหรับผู้บริหาร",
  home_visit_report: "รายงานเยี่ยมบ้าน",
  intervention_summary: "รายงานการช่วยเหลือ",
}

export type ReportJobType = keyof typeof knownReportTypeLabels

export const reportJobTypes = Object.keys(knownReportTypeLabels) as ReportJobType[]

function getReportTypeLabel(reportType: string): string {
  return knownReportTypeLabels[reportType] ?? reportType.replace(/_/g, " ")
}

function isReportJobType(reportType: string): reportType is ReportJobType {
  return reportJobTypes.includes(reportType as ReportJobType)
}

const signedUrlSeconds = 10 * 60

const validStatuses: ReportJobStatus[] = [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
]

function toReportJobStatus(status: string | null): ReportJobStatus {
  return validStatuses.includes(status as ReportJobStatus)
    ? (status as ReportJobStatus)
    : "queued"
}

export type RequestReportJobInput = {
  reportType: string
  title: string
  filters?: Record<string, unknown>
}

export async function requestReportJob(
  input: RequestReportJobInput,
): Promise<{ id: string }> {
  const { reportType, title, filters } = input
  const normalizedReportType = reportType.trim()

  if (!normalizedReportType || !isReportJobType(normalizedReportType)) {
    throw new Error("VALIDATION_ERROR:reportType")
  }

  if (!title || !title.trim()) {
    throw new Error("VALIDATION_ERROR:title")
  }

  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("UNAUTHORIZED")
  }

  const client = await createClient()

  const { data, error } = await client
    .from("report_jobs")
    .insert({
      school_id: context.schoolId,
      requested_by: context.profileId,
      report_type: normalizedReportType,
      title: title.trim(),
      filters: (filters as Json) ?? {},
      status: "queued",
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return { id: data.id }
}

export async function getReportJobs(limit = 20): Promise<ReportJobItem[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const { data, error } = await client
    .from("report_jobs")
    .select(
      `
      id,
      title,
      report_type,
      status,
      requested_at,
      completed_at,
      error_message,
      output_bucket,
      output_path,
      requested_by,
      profiles!report_jobs_requested_by_fkey (
        first_name,
        last_name
      )
    `,
    )
    .eq("school_id", context.schoolId)
    .order("requested_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as unknown as ReportJobQueryRow[]

  return Promise.all(
    rows.map(async (row) => {
      const status = toReportJobStatus(row.status)
      const hasOutput =
        status === "completed" && Boolean(row.output_bucket && row.output_path)

      let downloadUrl: string | null = null

      if (hasOutput && row.output_bucket && row.output_path) {
        const { data: signedData } = await client.storage
          .from(row.output_bucket)
          .createSignedUrl(row.output_path, signedUrlSeconds)

        downloadUrl = signedData?.signedUrl ?? null
      }

      const requesterName = row.profiles
        ? `${row.profiles.first_name ?? ""} ${row.profiles.last_name ?? ""}`.trim()
        : null

      return {
        id: row.id,
        title: row.title,
        reportType: getReportTypeLabel(row.report_type),
        status,
        requestedAt: row.requested_at,
        completedAt: row.completed_at,
        requestedByName: requesterName || null,
        errorMessage: row.error_message,
        hasOutput,
        downloadUrl,
      }
    }),
  )
}

export type PopularReportType = {
  reportType: string
  label: string
  count: number
}

export async function getPopularReportTypes(
  limit = 5,
): Promise<PopularReportType[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const { data, error } = await client
    .from("report_jobs")
    .select("report_type")
    .eq("school_id", context.schoolId)

  if (error || !data) {
    return []
  }

  // Aggregate counts manually
  const counts: Record<string, number> = {}
  for (const row of data) {
    const rt = (row as { report_type: string }).report_type
    counts[rt] = (counts[rt] ?? 0) + 1
  }

  // Sort by count descending
  const sorted = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)

  return sorted.map(([reportType, count]) => ({
    reportType,
    label: getReportTypeLabel(reportType),
    count,
  }))
}

/**
 * Process the next queued report job for the current school.
 * Transitions: queued → running → completed (with output placeholder) or failed.
 * Returns the updated job status or null if no queued jobs.
 */
export async function processNextReportJob(): Promise<{
  id: string
  status: ReportJobStatus
  errorMessage: string | null
} | null> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("UNAUTHORIZED")
  }

  const client = await createClient()

  // Pick the oldest queued job
  const { data: queued, error: fetchError } = await client
    .from("report_jobs")
    .select("id")
    .eq("school_id", context.schoolId)
    .eq("status", "queued")
    .order("requested_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (fetchError || !queued) {
    return null
  }

  const jobId = (queued as { id: string }).id

  // Mark as running
  const { error: runningError } = await client
    .from("report_jobs")
    .update({ status: "running" })
    .eq("id", jobId)
    .eq("school_id", context.schoolId)

  if (runningError) {
    throw new Error(runningError.message)
  }

  // Simulate report generation (placeholder — real generation not yet built)
  try {
    // In production, this would query data, build PDF/Excel, upload to storage
    const now = new Date().toISOString()

    const { error: completeError } = await client
      .from("report_jobs")
      .update({
        status: "completed",
        completed_at: now,
        output_bucket: "documents",
        output_path: `reports/${jobId}/report.txt`,
        error_message: null,
      })
      .eq("id", jobId)
      .eq("school_id", context.schoolId)

    if (completeError) {
      throw new Error(completeError.message)
    }

    return { id: jobId, status: "completed", errorMessage: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown generation error"

    await client
      .from("report_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("id", jobId)
      .eq("school_id", context.schoolId)

    return { id: jobId, status: "failed", errorMessage: message }
  }
}

