"use server"

import { revalidatePath } from "next/cache"

import {
  processReportJobById,
  reportJobTypes,
  requestReportJob,
} from "@/lib/server/report-read-models"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"
import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "@/lib/server/current-user"

export async function requestReportJobActionState(
  _previousState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const reportType = String(formData.get("reportType") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()

  if (!reportType) {
    return actionFail("VALIDATION_ERROR", "กรุณาเลือกประเภทรายงาน", {
      fieldErrors: { reportType: ["กรุณาเลือกประเภทรายงาน"] },
    })
  }

  if (!reportJobTypes.includes(reportType as (typeof reportJobTypes)[number])) {
    return actionFail("VALIDATION_ERROR", "ประเภทรายงานไม่ถูกต้อง", {
      fieldErrors: { reportType: ["ประเภทรายงานไม่ถูกต้อง"] },
    })
  }

  if (!title) {
    return actionFail("VALIDATION_ERROR", "กรุณากรอกชื่อรายงาน", {
      fieldErrors: { title: ["กรุณากรอกชื่อรายงาน"] },
    })
  }

  if (title.length > 255) {
    return actionFail("VALIDATION_ERROR", "ชื่อรายงานต้องไม่เกิน 255 ตัวอักษร", {
      fieldErrors: { title: ["ชื่อรายงานต้องไม่เกิน 255 ตัวอักษร"] },
    })
  }

  try {
    const result = await requestReportJob({ reportType, title })

    // Trigger immediate generation in background
    processReportJobById(result.id).catch(console.error)

    revalidatePath("/reports")

    return actionOk("ขอสร้างรายงานแล้ว ระบบกำลังสร้างไฟล์เอกสาร", {
      data: { id: result.id },
      revalidated: ["/reports"],
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบอีกครั้ง")
      }

      if (error.message === "FORBIDDEN") {
        return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์สร้างรายงาน")
      }

      if (error.message === "VALIDATION_ERROR:reportType") {
        return actionFail("VALIDATION_ERROR", "ประเภทรายงานไม่ถูกต้อง", {
          fieldErrors: { reportType: ["ประเภทรายงานไม่ถูกต้อง"] },
        })
      }

      if (error.message === "VALIDATION_ERROR:title") {
        return actionFail("VALIDATION_ERROR", "กรุณากรอกชื่อรายงาน", {
          fieldErrors: { title: ["กรุณากรอกชื่อรายงาน"] },
        })
      }

      return actionFail("INTERNAL_ERROR", error.message)
    }

    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการสร้างรายงาน")
  }
}

/**
 * Process a specific report job or next queued.
 */
export async function processReportJobAction(jobId?: string): Promise<
  ActionResult<{ id: string; status: string; downloadUrl?: string | null } | null>
> {
  try {
    const result = await processReportJobById(jobId)

    if (!result) {
      return actionOk("ไม่มีรายงานที่รอดำเนินการ", { data: null })
    }

    revalidatePath("/reports")

    if (result.status === "completed") {
      return actionOk("สร้างไฟล์รายงานเอกสารสำเร็จ", {
        data: { id: result.id, status: result.status, downloadUrl: result.downloadUrl },
      })
    }

    return actionFail("INTERNAL_ERROR", result.errorMessage ?? "การสร้างรายงานล้มเหลว")
  } catch (err) {
    return actionFail(
      "INTERNAL_ERROR",
      err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
    )
  }
}

/**
 * Retry a failed or queued report job.
 */
export async function retryReportJobAction(jobId: string): Promise<ActionResult> {
  try {
    const context = await getCurrentUserContext()
    const client = await createClient()

    const { error: resetErr } = await client
      .from("report_jobs")
      .update({ status: "queued", error_message: null })
      .eq("id", jobId)
      .eq("school_id", context.schoolId)

    if (resetErr) {
      return actionFail("INTERNAL_ERROR", `ไม่สามารถเริ่มสร้างรายงานใหม่ได้: ${resetErr.message}`)
    }

    // Trigger generation
    const res = await processReportJobById(jobId)
    revalidatePath("/reports")

    if (res?.status === "completed") {
      return actionOk("สร้างไฟล์รายงานใหม่สำเร็จ")
    }

    return actionOk("กำลังประมวลผลรายงานใหม่")
  } catch (err) {
    return actionFail("INTERNAL_ERROR", err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
  }
}

/**
 * Delete a report job and its generated file.
 */
export async function deleteReportJobAction(jobId: string): Promise<ActionResult> {
  try {
    const context = await getCurrentUserContext()
    const client = await createClient()

    // Fetch storage path
    const { data: job } = await client
      .from("report_jobs")
      .select("output_bucket, output_path")
      .eq("id", jobId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (job?.output_bucket && job.output_path) {
      await client.storage.from(job.output_bucket).remove([job.output_path])
    }

    const { error: delErr } = await client
      .from("report_jobs")
      .delete()
      .eq("id", jobId)
      .eq("school_id", context.schoolId)

    if (delErr) {
      return actionFail("INTERNAL_ERROR", `ไม่สามารถลบรายงานได้: ${delErr.message}`)
    }

    revalidatePath("/reports")
    return actionOk("ลบรายงานเรียบร้อยแล้ว")
  } catch (err) {
    return actionFail("INTERNAL_ERROR", err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
  }
}
