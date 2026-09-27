"use server"

import { revalidatePath } from "next/cache"

import { deleteNotification, markAllNotificationsRead, setMutedNotificationTypes, toggleNotificationRead } from "@/lib/server/notification-read-models"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

export async function toggleNotificationReadAction(
  notificationId: string,
): Promise<ActionResult<{ isRead: boolean }>> {
  if (!notificationId || !UUID_RE.test(notificationId)) {
    return actionFail("VALIDATION_ERROR", "รหัสการแจ้งเตือนไม่ถูกต้อง")
  }

  try {
    const result = await toggleNotificationRead(notificationId)

    revalidatePath("/notifications")

    return actionOk(
      result.isRead ? "ทำเครื่องหมายว่าอ่านแล้ว" : "ทำเครื่องหมายว่ายังไม่ได้อ่าน",
      {
        data: { isRead: result.isRead },
        revalidated: ["/notifications"],
      },
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบอีกครั้ง")
      }

      if (error.message === "FORBIDDEN") {
        return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ดำเนินการนี้")
      }

      if (error.message === "VALIDATION_ERROR") {
        return actionFail("VALIDATION_ERROR", "รหัสการแจ้งเตือนไม่ถูกต้อง")
      }

      if (error.message === "NOT_FOUND") {
        return actionFail("NOT_FOUND", "ไม่พบการแจ้งเตือนนี้")
      }

      return actionFail("INTERNAL_ERROR", error.message)
    }

    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการเปลี่ยนสถานะการอ่าน")
  }
}

export async function updateNotificationPreferencesAction(
  _previousState: ActionResult<{ muted: string[] }> | null,
  formData: FormData,
): Promise<ActionResult<{ muted: string[] }>> {
  try {
    const saved = await setMutedNotificationTypes(
      formData.getAll("types").filter((v): v is string => typeof v === "string"),
    )
    revalidatePath("/notifications")

    return actionOk("บันทึกการตั้งค่าแจ้งเตือนแล้ว", {
      data: { muted: saved },
      revalidated: ["/notifications"],
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
        return actionFail(error.message, "กรุณาเข้าสู่ระบบอีกครั้ง")
      }

      return actionFail("INTERNAL_ERROR", error.message)
    }

    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า")
  }
}

export async function deleteNotificationAction(
  notificationId: string,
): Promise<ActionResult<{ id: string }>> {
  if (!notificationId || !UUID_RE.test(notificationId)) {
    return actionFail("VALIDATION_ERROR", "รหัสการแจ้งเตือนไม่ถูกต้อง")
  }

  try {
    await deleteNotification(notificationId)

    revalidatePath("/notifications")

    return actionOk("ลบการแจ้งเตือนเรียบร้อยแล้ว", {
      data: { id: notificationId },
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

    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการลบการแจ้งเตือน")
  }
}
