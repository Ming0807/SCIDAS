"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"

import {
  deleteReportJob,
  processReportJobById,
  reportJobTypes,
  requestReportJob,
  retryReportJob,
} from "@/lib/server/report-read-models"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"

export async function requestReportJobActionState(
  _previousState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const reportType = String(formData.get("reportType") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const rawFormat = String(formData.get("format") ?? "pdf").toLowerCase().trim()
  const format = rawFormat === "xlsx" ? "xlsx" : "pdf"

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
    const result = await requestReportJob({
      reportType,
      title,
      filters: { format },
    })

    // Next.js 16 after() schedules background execution after response completes
    after(async () => {
      try {
        await processReportJobById(result.id)
      } catch (err) {
        console.error("Background report generation error:", err)
      }
    })

    revalidatePath("/reports")

    return actionOk("ขอสร้างรายงานแล้ว ระบบกำลังสร้างไฟล์เอกสารในพื้นหลัง", {
      data: { id: result.id },
      revalidated: ["/reports"],
    })
  } catch (error) {
    console.error("requestReportJobActionState error:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการสร้างคำขอรายงาน กรุณาลองใหม่อีกครั้ง")
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
    console.error("processReportJobAction error:", err)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการประมวลผลรายงาน")
  }
}

/**
 * Retry a failed report job.
 */
export async function retryReportJobAction(jobId: string): Promise<ActionResult> {
  try {
    const reset = await retryReportJob(jobId)
    if (!reset) {
      return actionFail("CONFLICT", "รายงานนี้ไม่อยู่ในสถานะที่ลองใหม่ได้ หรือคุณไม่มีสิทธิ์ดำเนินการ")
    }

    // Schedule background processing via after()
    after(async () => {
      try {
        await processReportJobById(jobId)
      } catch (err) {
        console.error("Background retry report generation error:", err)
      }
    })

    revalidatePath("/reports")
    return actionOk("กำลังสร้างรายงานใหม่อีกครั้งในพื้นหลัง")
  } catch (err) {
    console.error("retryReportJobAction error:", err)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการเริ่มสร้างรายงานใหม่")
  }
}

/**
 * Delete a report job and its generated file.
 */
export async function deleteReportJobAction(jobId: string): Promise<ActionResult> {
  try {
    await deleteReportJob(jobId)
    revalidatePath("/reports")
    return actionOk("ลบรายงานเรียบร้อยแล้ว")
  } catch (err) {
    console.error("deleteReportJobAction error:", err)
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ลบรายงานนี้")
    }
    if (err instanceof Error && err.message === "STORAGE_DELETE_FAILED") {
      return actionFail(
        "INTERNAL_ERROR",
        "ไม่สามารถลบไฟล์รายงานจากพื้นที่จัดเก็บได้ รายการรายงานยังคงอยู่",
      )
    }
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการลบรายงาน")
  }
}
