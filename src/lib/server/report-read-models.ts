import type { Database, Json } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext } from "./current-user"
import { generateReportArtifact } from "./report-generator"

type PublicTables = Database["public"]["Tables"]
type ReportJobRow = PublicTables["report_jobs"]["Row"]
type ClaimedReportJob = Pick<
  ReportJobRow,
  "id" | "school_id" | "report_type" | "title" | "filters"
> & {
  claim_token: string
}
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
  attendance_report: "รายงานการมาเรียน",
  attendance_summary: "รายงานสรุปการมาเรียน",
  academic_report: "รายงานผลการเรียน",
}

export type ReportJobType = keyof typeof knownReportTypeLabels

export const reportJobTypes = Object.keys(knownReportTypeLabels) as ReportJobType[]

export function getReportTypeLabel(reportType: string): string {
  return knownReportTypeLabels[reportType] ?? reportType.replace(/_/g, " ")
}

export function isReportJobType(reportType: string): reportType is ReportJobType {
  return reportJobTypes.includes(reportType as ReportJobType)
}

function reportLifecycleError(operation: string, error: { message: string }) {
  console.error(`${operation} error:`, error)
  return new Error(`ไม่สามารถ${operation}ได้`)
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
    console.error("requestReportJob error:", error)
    throw new Error("ไม่สามารถสร้างรายการคำขอรายงานได้")
  }

  return { id: data.id }
}

export async function getReportJobs(limit = 20): Promise<ReportJobItem[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  // Recovery is a leadership maintenance operation; regular staff can still
  // read the school-wide report queue without attempting a forbidden RPC.
  if (context.role === "admin" || context.role === "director") {
    try {
      await recoverStaleReportJobs()
    } catch (recErr) {
      console.warn("Stale job recovery warning:", recErr)
    }
  }

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
    console.error("getReportJobs error:", error)
    return []
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

export async function claimReportJob(jobId?: string): Promise<ClaimedReportJob | null> {
  const client = await createClient()
  const { data, error } = await client
    .rpc("claim_report_job", { p_job_id: jobId ?? null })
    .maybeSingle()

  if (error) {
    throw reportLifecycleError("รับงานรายงาน", error)
  }

  return (data as ClaimedReportJob | null) ?? null
}

export async function completeReportJob(
  jobId: string,
  claimToken: string,
  outputPath: string,
): Promise<boolean> {
  const client = await createClient()
  const { data, error } = await client.rpc("complete_report_job", {
    p_job_id: jobId,
    p_claim_token: claimToken,
    p_output_path: outputPath,
  })

  if (error) {
    throw reportLifecycleError("บันทึกผลรายงาน", error)
  }

  return data === true
}

export async function failReportJob(
  jobId: string,
  claimToken: string,
  errorMessage: string,
): Promise<boolean> {
  const client = await createClient()
  const { data, error } = await client.rpc("fail_report_job", {
    p_job_id: jobId,
    p_claim_token: claimToken,
    p_error_message: errorMessage,
  })

  if (error) {
    throw reportLifecycleError("บันทึกความล้มเหลวของรายงาน", error)
  }

  return data === true
}

export async function retryReportJob(jobId: string): Promise<boolean> {
  const client = await createClient()
  const { data, error } = await client.rpc("retry_report_job", {
    p_job_id: jobId,
  })

  if (error) {
    throw reportLifecycleError("เริ่มรายงานใหม่", error)
  }

  return data === true
}

/**
 * Processes a claimed report job. The database owns lifecycle transitions and
 * the claim token prevents stale workers from overwriting newer attempts.
 */
export async function processReportJobById(jobId?: string): Promise<{
  id: string
  status: ReportJobStatus
  errorMessage: string | null
  downloadUrl?: string | null
} | null> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const claimedJob = await claimReportJob(jobId)
  if (!claimedJob || claimedJob.school_id !== context.schoolId) return null
  let uploadedStoragePath: string | null = null

  try {
    // 2. Generate Genuine File Artifact (Thai PDF or XLSX)
    const artifact = await generateReportArtifact({
      id: claimedJob.id,
      schoolId: claimedJob.school_id,
      reportType: claimedJob.report_type,
      title: claimedJob.title,
      filters: (claimedJob.filters as Record<string, unknown>) || {},
    })

    const storagePath = `${claimedJob.school_id}/${artifact.fileName}`

    // 3. Upload to private Supabase Storage 'reports' bucket
    const { error: uploadError } = await client.storage
      .from("reports")
      .upload(storagePath, artifact.buffer, {
        contentType: artifact.contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error("Report storage upload error:", uploadError)
      throw new Error("ไม่สามารถอัปโหลดไฟล์รายงานไปยังระบบจัดเก็บได้")
    }
    uploadedStoragePath = storagePath

    // 4. Mark job as completed
    const completed = await completeReportJob(
      claimedJob.id,
      claimedJob.claim_token,
      storagePath,
    )

    if (!completed) {
      const { error: cleanupError } = await client.storage
        .from("reports")
        .remove([storagePath])
      if (cleanupError) {
        console.warn("Report artifact cleanup after lost claim failed:", cleanupError)
      }
      return null
    }

    const { data: signed } = await client.storage
      .from("reports")
      .createSignedUrl(storagePath, signedUrlSeconds)

    return {
      id: claimedJob.id,
      status: "completed",
      errorMessage: null,
      downloadUrl: signed?.signedUrl || null,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการประมวลผลไฟล์รายงาน"
    console.error("processReportJobById failure:", err)

    let markedFailed = false
    try {
      markedFailed = await failReportJob(claimedJob.id, claimedJob.claim_token, errorMsg)
    } catch (failErr) {
      console.error("Report failure status update error:", failErr)
    }

    if (!markedFailed) return null

    if (uploadedStoragePath) {
      const { error: cleanupError } = await client.storage
        .from("reports")
        .remove([uploadedStoragePath])
      if (cleanupError) {
        console.warn("Report artifact cleanup after failed generation failed:", cleanupError)
      }
    }

    return {
      id: claimedJob.id,
      status: "failed",
      errorMessage: errorMsg,
    }
  }
}

/**
 * Recovers stale running jobs that timed out (> 10 minutes without completion).
 */
export async function recoverStaleReportJobs(): Promise<{ recoveredCount: number }> {
  const client = await createClient()

  const staleCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data, error } = await client.rpc("recover_stale_report_jobs", {
    p_stale_before: staleCutoff,
  })

  if (error) {
    throw reportLifecycleError("กู้คืนงานรายงานที่ค้าง", error)
  }

  return { recoveredCount: data ?? 0 }
}

/**
 * Deletes the artifact first, then the DB row. These are separate systems, so
 * the DB row is intentionally preserved when Storage removal fails.
 */
export async function deleteReportJob(
  jobId: string,
): Promise<{ success: boolean }> {
  const context = await getCurrentUserContext()
  if (!context.profileId) {
    throw new Error("UNAUTHORIZED")
  }

  const client = await createClient()

  // 1. Fetch job to verify owner/school and storage path
  const { data: job, error: fetchErr } = await client
    .from("report_jobs")
    .select("id, school_id, requested_by, output_bucket, output_path")
    .eq("id", jobId)
    .eq("school_id", context.schoolId)
    .maybeSingle()

  if (fetchErr || !job) {
    throw new Error("NOT_FOUND")
  }

  const isAdminOrDirector = context.role === "admin" || context.role === "director"
  if (job.requested_by !== context.profileId && !isAdminOrDirector) {
    throw new Error("FORBIDDEN")
  }

  // 2. Remove file from storage if present
  if (job.output_path) {
    if (job.output_bucket !== "reports") {
      throw new Error("STORAGE_DELETE_FAILED")
    }

    try {
      const { error: storageDelErr } = await client.storage
        .from("reports")
        .remove([job.output_path])

      if (storageDelErr) {
        console.error("Storage file removal error:", storageDelErr)
        throw new Error("STORAGE_DELETE_FAILED")
      }
    } catch (sErr) {
      if (sErr instanceof Error && sErr.message === "STORAGE_DELETE_FAILED") {
        throw sErr
      }
      console.error("Storage delete exception:", sErr)
      throw new Error("STORAGE_DELETE_FAILED")
    }
  }

  // 3. Delete database row
  const { error: dbDelErr } = await client
    .from("report_jobs")
    .delete()
    .eq("id", jobId)
    .eq("school_id", context.schoolId)

  if (dbDelErr) {
    console.error("Report job database delete error:", dbDelErr)
    throw new Error("ไม่สามารถลบรายการรายงานได้")
  }

  return { success: true }
}
