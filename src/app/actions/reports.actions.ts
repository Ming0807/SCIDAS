"use server"

import { revalidatePath } from "next/cache"

import { reportJobTypes, requestReportJob } from "@/lib/server/report-read-models"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"

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

    revalidatePath("/reports")

    return actionOk("สร้างรายงานแล้ว", {
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
