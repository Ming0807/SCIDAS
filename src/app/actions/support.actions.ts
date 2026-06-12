"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"

type SeverityLevel = Database["public"]["Enums"]["severity_level"]
type SupportType = Database["public"]["Enums"]["support_type"]

export async function getSupportRecords() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('support_records')
    .select('*, students(first_name, last_name, student_code), profiles!support_records_provided_by_fkey(first_name, last_name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching support records:", error)
    return []
  }
  return data
}

export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, position')
    .eq('is_active', true)
    
  if (error) {
    console.error("Error fetching profiles:", error)
    return []
  }
  return data
}

export async function createSupportRecord(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนสร้างบันทึกการช่วยเหลือ")
    }

    const studentId = formData.get("student_id") as string
    const supportType = formData.get("support_type") as SupportType
    const priority = formData.get("priority") as SeverityLevel
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const assignedTo = formData.get("assigned_to") as string

    if (!studentId) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกนักเรียน", {
        fieldErrors: { student_id: ["กรุณาเลือกนักเรียน"] },
      })
    }
    if (!title || !title.trim()) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกหัวข้อ", {
        fieldErrors: { title: ["กรุณากรอกหัวข้อ"] },
      })
    }

    const client = await createClient()
    const providedBy = assignedTo || context.profileId

    const semesterId = await getCurrentSemesterId(context.schoolId)

    if (!semesterId) {
      return actionFail("INTERNAL_ERROR", "ไม่พบภาคการศึกษาในระบบ")
    }

    const { data, error } = await client
      .from("support_records")
      .insert({
        student_id: studentId,
        semester_id: semesterId,
        school_id: context.schoolId,
        support_type: supportType || "other",
        priority: priority || "medium",
        title: title.trim(),
        description: description?.trim() || "",
        provided_by: providedBy,
        status: "pending",
      })
      .select("id")
      .single()

    if (error) {
      return actionFail("INTERNAL_ERROR", error.message)
    }

    revalidatePath("/support")
    revalidatePath("/support/new")

    return actionOk("สร้างบันทึกการช่วยเหลือสำเร็จ", { data: { id: data.id } })
  } catch (err) {
    return actionFail("INTERNAL_ERROR", err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ")
  }
}

/**
 * Form-action compatible wrapper for `<form action={createSupportRecordFormAction}>`.
 */
export async function createSupportRecordFormAction(formData: FormData): Promise<void> {
  const result = await createSupportRecord(null, formData)
  if (!result.ok) throw new Error(result.message)
}
