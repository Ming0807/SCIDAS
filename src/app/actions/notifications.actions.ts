"use server"

import { revalidatePath } from "next/cache"

import { markAllNotificationsRead } from "@/lib/server/notification-read-models"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"

export async function markAllAsReadAction(): Promise<ActionResult<{ count: number }>> {
  try {
    const result = await markAllNotificationsRead()

    revalidatePath("/notifications")

    return actionOk("ทำเครื่องหมายว่าอ่านแล้วทั้งหมด", {
      data: { count: result.count },
      revalidated: ["/notifications"],
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบอีกครั้ง")
      }

      if (error.message === "FORBIDDEN") {
        return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ดำเนินการนี้")
      }

      return actionFail("INTERNAL_ERROR", error.message)
    }

    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านแล้ว")
  }
}

export async function markAllAsReadFormAction(formData: FormData): Promise<void> {
  void formData
  await markAllAsReadAction()
}
