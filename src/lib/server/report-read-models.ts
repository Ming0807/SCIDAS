import type { Database, Json } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext } from "./current-user"
import { generateReportArtifact } from "./report-generator"

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
  risk_assessment: "รายงานการประเมินความเสี่ยง",
  behavior_report: "รายงานพฤติกรรม",
  academic_report: "รายงานผลการเรียน",
  support_report: "รายงานการดูแลช่วยเหลือ",
  idp_report: "รายงานพัฒนารายบุคคล",
  attendance_report: "รายงานการมาเรียน",
  attendance_summary: "รายงานสรุปการมาเรียน",
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

const signedUrlSeconds = 60 * 60 // 1 hour valid signed URL

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

  const counts: Record<string, number> = {}
  for (const row of data) {
    const rt = (row as { report_type: string }).report_type
    counts[rt] = (counts[rt] ?? 0) + 1
  }

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
 * Process a specific report job or the next queued report job.
 * Executes genuine PDF/XLSX generation, uploads to Supabase Storage, and updates DB status.
 */
export async function processReportJobById(jobId?: string): Promise<{
  id: string
  status: ReportJobStatus
  errorMessage: string | null
  downloadUrl?: string | null
} | null> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  let targetJobId = jobId

  if (!targetJobId) {
    // Pick the oldest queued job
    const { data: queued } = await client
      .from("report_jobs")
      .select("id")
      .eq("school_id", context.schoolId)
      .eq("status", "queued")
      .order("requested_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!queued) return null
    targetJobId = (queued as { id: string }).id
  }

  // Fetch job details
  const { data: jobRow, error: jobErr } = await client
    .from("report_jobs")
    .select("id, school_id, report_type, title, filters")
    .eq("id", targetJobId)
    .eq("school_id", context.schoolId)
    .single()

  if (jobErr || !jobRow) {
    return null
  }

  // 1. Mark as running
  await client
    .from("report_jobs")
    .update({ status: "running", started_at: new Date().toISOString(), error_message: null })
    .eq("id", targetJobId)

  try {
    // 2. Generate Real File Artifact
    const artifact = await generateReportArtifact({
      id: jobRow.id,
      schoolId: jobRow.school_id,
      reportType: jobRow.report_type,
      title: jobRow.title,
      filters: (jobRow.filters as Record<string, unknown>) || {},
    })

    const storagePath = `${jobRow.school_id}/${artifact.fileName}`

    // 3. Upload to Supabase Storage 'reports' bucket
    const { error: uploadError } = await client.storage
      .from("reports")
      .upload(storagePath, artifact.buffer, {
        contentType: artifact.contentType,
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // 4. Mark completed
    const completedNow = new Date().toISOString()
    const { error: updateErr } = await client
      .from("report_jobs")
      .update({
        status: "completed",
        completed_at: completedNow,
        output_bucket: "reports",
        output_path: storagePath,
        error_message: null,
      })
      .eq("id", targetJobId)

    if (updateErr) {
      throw new Error(updateErr.message)
    }

    const { data: signed } = await client.storage
      .from("reports")
      .createSignedUrl(storagePath, signedUrlSeconds)

    return {
      id: targetJobId,
      status: "completed",
      errorMessage: null,
      downloadUrl: signed?.signedUrl || null,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Report generation failed"

    await client
      .from("report_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: errorMsg,
      })
      .eq("id", targetJobId)

    return {
      id: targetJobId,
      status: "failed",
      errorMessage: errorMsg,
    }
  }
}

export async function processNextReportJob() {
  return processReportJobById()
}
