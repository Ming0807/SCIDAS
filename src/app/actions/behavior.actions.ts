"use server"

import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

type BehaviorType = Database["public"]["Enums"]["behavior_type"]

const validBehaviorTypes: BehaviorType[] = ["positive", "negative", "neutral"]

export async function getBehaviorRecords() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('behavior_records')
    .select('*, students(first_name, last_name, student_code), profiles!behavior_records_reported_by_fkey(first_name, last_name)')
    .order('date', { ascending: false })

  if (error) {
    console.error("Error fetching behavior records:", error)
    return []
  }
  return data
}

export async function createBehaviorRecordAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนบันทึกพฤติกรรม")
    }

    const studentId = formData.get("student_id") as string
    const behaviorType = formData.get("behavior_type") as BehaviorType
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const pointsStr = formData.get("points") as string
    const dateStr = formData.get("date") as string

    // Validation
    if (!studentId || typeof studentId !== "string") {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกนักเรียน", {
        fieldErrors: { student_id: ["กรุณาเลือกนักเรียน"] },
      })
    }

    if (!behaviorType || !validBehaviorTypes.includes(behaviorType)) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกประเภทพฤติกรรม", {
        fieldErrors: { behavior_type: ["กรุณาเลือกประเภทพฤติกรรม"] },
      })
    }

    if (!description || !description.trim()) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกรายละเอียดพฤติกรรม", {
        fieldErrors: { description: ["กรุณากรอกรายละเอียดพฤติกรรม"] },
      })
    }

    const points = pointsStr ? parseInt(pointsStr, 10) : 0

    if (Number.isNaN(points)) {
      return actionFail("VALIDATION_ERROR", "คะแนนต้องเป็นตัวเลข", {
        fieldErrors: { points: ["คะแนนต้องเป็นตัวเลข"] },
      })
    }

    const date = dateStr
      ? new Date(dateStr).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    const client = await createClient()

    const { data, error } = await client
      .from("behavior_records")
      .insert({
        student_id: studentId,
        behavior_type: behaviorType,
        category: category || null,
        description: description.trim(),
        points,
        reported_by: context.profileId,
        school_id: context.schoolId,
        date,
      })
      .select("id")
      .single()

    if (error) {
      return actionFail("INTERNAL_ERROR", error.message)
    }

    revalidatePath("/behavior")
    revalidatePath("/behavior/record")

    return actionOk("บันทึกพฤติกรรมสำเร็จ", { data: { id: data.id } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
    return actionFail("INTERNAL_ERROR", message)
  }
}

/**
 * Form-action compatible wrapper for `<form action={createBehaviorRecord}>`.
 * Returns void and revalidates on success; throws on failure so the form can
 * show a generic error boundary.
 */
export async function createBehaviorRecord(formData: FormData): Promise<void> {
  const result = await createBehaviorRecordAction(null, formData)

  if (!result.ok) {
    throw new Error(result.message)
  }
}
