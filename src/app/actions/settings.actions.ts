"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

type SettingsActionData = { saved: true }

function readText(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function invalid(field: string, message: string): ActionResult<SettingsActionData> {
  return actionFail("VALIDATION_ERROR", "กรุณาตรวจสอบข้อมูลที่กรอก", {
    fieldErrors: { [field]: [message] },
  })
}

function isSafeAvatarUrl(value: string) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export async function updateOwnProfile(
  _previous: ActionResult<SettingsActionData> | null,
  formData: FormData,
): Promise<ActionResult<SettingsActionData>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return actionFail("FORBIDDEN", "บัญชีนี้ไม่มีโปรไฟล์บุคลากร")

    const firstName = readText(formData, "first_name")
    const lastName = readText(formData, "last_name")
    const phone = readText(formData, "phone")
    const position = readText(formData, "position")
    const avatarUrl = readText(formData, "avatar_url")

    if (!firstName) return invalid("first_name", "กรุณากรอกชื่อ")
    if (firstName.length > 100) return invalid("first_name", "ชื่อต้องไม่เกิน 100 ตัวอักษร")
    if (!lastName) return invalid("last_name", "กรุณากรอกนามสกุล")
    if (lastName.length > 100) return invalid("last_name", "นามสกุลต้องไม่เกิน 100 ตัวอักษร")
    if (phone.length > 20) return invalid("phone", "เบอร์โทรศัพท์ต้องไม่เกิน 20 ตัวอักษร")
    if (position.length > 100) return invalid("position", "ตำแหน่งต้องไม่เกิน 100 ตัวอักษร")
    if (avatarUrl.length > 2048 || !isSafeAvatarUrl(avatarUrl)) {
      return invalid("avatar_url", "URL รูปโปรไฟล์ต้องเป็น http หรือ https")
    }

    const client = await createClient()
    const { error } = await client
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        position: position || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", context.profileId)
      .eq("school_id", context.schoolId)

    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกข้อมูลส่วนตัวได้")

    revalidatePath("/settings")
    revalidatePath("/", "layout")
    return actionOk("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว", { data: { saved: true } })
  } catch (error) {
    return actionFail(
      error instanceof Error && error.message === "UNAUTHORIZED" ? "UNAUTHORIZED" : "INTERNAL_ERROR",
      "ไม่สามารถบันทึกการตั้งค่าได้",
    )
  }
}
