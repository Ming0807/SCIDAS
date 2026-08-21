"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

type BehaviorType = Database["public"]["Enums"]["behavior_type"]
type BehaviorActionData = { id: string }

const validBehaviorTypes: BehaviorType[] = ["positive", "negative", "neutral"]
const behaviorEditors = new Set(["admin", "homeroom_teacher", "subject_teacher", "counselor"])

type MutableBehaviorFields = {
  studentId: string
  behaviorType: BehaviorType
  category: string | null
  description: string
  points: number
  date: string
}

type ParsedBehaviorFields =
  | { ok: true; fields: MutableBehaviorFields }
  | { ok: false; result: ActionResult<BehaviorActionData> }

function getFormString(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function parseDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? null
    : value
}

function parseMutableBehaviorFields(
  formData: FormData,
  { dateRequired }: { dateRequired: boolean },
): ParsedBehaviorFields {
  const studentId = getFormString(formData, "student_id")
  const behaviorType = getFormString(formData, "behavior_type") as BehaviorType
  const categoryValue = getFormString(formData, "category")
  const description = getFormString(formData, "description")
  const pointsValue = getFormString(formData, "points")
  const dateValue = getFormString(formData, "date")

  if (!studentId) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณาเลือกนักเรียน", {
        fieldErrors: { student_id: ["กรุณาเลือกนักเรียน"] },
      }),
    }
  }

  if (!validBehaviorTypes.includes(behaviorType)) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณาเลือกประเภทพฤติกรรม", {
        fieldErrors: { behavior_type: ["กรุณาเลือกประเภทพฤติกรรม"] },
      }),
    }
  }

  if (categoryValue.length > 100) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "หมวดหมู่ต้องมีความยาวไม่เกิน 100 ตัวอักษร", {
        fieldErrors: { category: ["หมวดหมู่ต้องมีความยาวไม่เกิน 100 ตัวอักษร"] },
      }),
    }
  }

  if (!description) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณากรอกรายละเอียดพฤติกรรม", {
        fieldErrors: { description: ["กรุณากรอกรายละเอียดพฤติกรรม"] },
      }),
    }
  }

  const points = pointsValue === "" ? 0 : Number(pointsValue)
  if (!Number.isSafeInteger(points)) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "คะแนนต้องเป็นจำนวนเต็ม", {
        fieldErrors: { points: ["คะแนนต้องเป็นจำนวนเต็ม"] },
      }),
    }
  }

  const dateValueToUse = dateValue || (dateRequired ? "" : new Date().toISOString().slice(0, 10))
  const date = parseDate(dateValueToUse)
  if (!date) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณาระบุวันที่ให้ถูกต้อง", {
        fieldErrors: { date: ["กรุณาระบุวันที่ให้ถูกต้อง"] },
      }),
    }
  }

  return {
    ok: true,
    fields: {
      studentId,
      behaviorType,
      category: categoryValue || null,
      description,
      points,
      date,
    },
  }
}

function actionFailureFromError(
  error: unknown,
  fallbackMessage: string,
): ActionResult<BehaviorActionData> {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (error.message === "FORBIDDEN") {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ดำเนินการนี้")
    }
  }

  return actionFail("INTERNAL_ERROR", fallbackMessage)
}

async function verifyStudentInSchool(
  client: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  schoolId: string,
): Promise<ActionResult<BehaviorActionData> | null> {
  const { data, error } = await client
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("school_id", schoolId)
    .maybeSingle()

  if (error) {
    return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบข้อมูลนักเรียนได้")
  }

  if (!data) {
    return actionFail("FORBIDDEN", "ไม่สามารถบันทึกให้กับนักเรียนจากโรงเรียนอื่นได้", {
      fieldErrors: { student_id: ["นักเรียนที่เลือกไม่อยู่ในโรงเรียนปัจจุบัน"] },
    })
  }

  return null
}

/**
 * Kept for compatibility with older callers, but explicitly scoped to the
 * authenticated user's school before returning any records.
 */
export async function getBehaviorRecords() {
  const context = await getCurrentUserContext()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("behavior_records")
    .select(
      "*, students(first_name, last_name, student_code), profiles!behavior_records_reported_by_fkey(first_name, last_name)",
    )
    .eq("school_id", context.schoolId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching behavior records:", error)
    return []
  }

  return data
}

export async function createBehaviorRecordAction(
  _prev: ActionResult<BehaviorActionData> | null,
  formData: FormData,
): Promise<ActionResult<BehaviorActionData>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนบันทึกพฤติกรรม")
    }
    if (!behaviorEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกพฤติกรรม")
    }

    const parsed = parseMutableBehaviorFields(formData, { dateRequired: false })
    if (!parsed.ok) return parsed.result

    const client = await createClient()
    const studentError = await verifyStudentInSchool(
      client,
      parsed.fields.studentId,
      context.schoolId,
    )
    if (studentError) return studentError

    const { data, error } = await client
      .from("behavior_records")
      .insert({
        student_id: parsed.fields.studentId,
        behavior_type: parsed.fields.behaviorType,
        category: parsed.fields.category,
        description: parsed.fields.description,
        points: parsed.fields.points,
        reported_by: context.profileId,
        school_id: context.schoolId,
        date: parsed.fields.date,
      })
      .select("id")
      .single()

    if (error) {
      return error.code === "42501"
        ? actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกพฤติกรรมนี้")
        : actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกพฤติกรรมได้")
    }

    revalidatePath("/behavior")
    revalidatePath("/behavior/record")
    revalidatePath(`/behavior/${data.id}`)

    return actionOk("บันทึกพฤติกรรมสำเร็จ", {
      data: { id: data.id },
      redirectTo: `/behavior/${data.id}`,
      revalidated: ["/behavior", "/behavior/record", `/behavior/${data.id}`],
    })
  } catch (error) {
    return actionFailureFromError(error, "ไม่สามารถบันทึกพฤติกรรมได้")
  }
}

export async function updateBehaviorRecordAction(
  _prev: ActionResult<BehaviorActionData> | null,
  formData: FormData,
): Promise<ActionResult<BehaviorActionData>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนแก้ไขพฤติกรรม")
    }
    if (!behaviorEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขพฤติกรรม")
    }

    const recordId = getFormString(formData, "record_id")
    if (!recordId) {
      return actionFail("VALIDATION_ERROR", "ไม่พบรหัสบันทึกพฤติกรรม")
    }

    const parsed = parseMutableBehaviorFields(formData, { dateRequired: true })
    if (!parsed.ok) return parsed.result

    const client = await createClient()
    const { data: record, error: recordError } = await client
      .from("behavior_records")
      .select("id, reported_by")
      .eq("id", recordId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (recordError) {
      return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบบันทึกพฤติกรรมได้")
    }

    if (!record) {
      return actionFail("NOT_FOUND", "ไม่พบบันทึกพฤติกรรมนี้")
    }
    if (context.role !== "admin" && record.reported_by !== context.profileId) {
      return actionFail("FORBIDDEN", "แก้ไขได้เฉพาะรายการที่คุณเป็นผู้บันทึก")
    }

    const studentError = await verifyStudentInSchool(
      client,
      parsed.fields.studentId,
      context.schoolId,
    )
    if (studentError) return studentError

    // Actor and tenancy columns are intentionally omitted from this payload.
    const { error } = await client
      .from("behavior_records")
      .update({
        student_id: parsed.fields.studentId,
        behavior_type: parsed.fields.behaviorType,
        category: parsed.fields.category,
        description: parsed.fields.description,
        points: parsed.fields.points,
        date: parsed.fields.date,
      })
      .eq("id", record.id)
      .eq("school_id", context.schoolId)

    if (error) {
      return error.code === "42501"
        ? actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขบันทึกพฤติกรรมนี้")
        : actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขบันทึกพฤติกรรมได้")
    }

    revalidatePath("/behavior")
    revalidatePath(`/behavior/${record.id}`)
    revalidatePath(`/behavior/${record.id}/edit`)
    revalidatePath("/behavior/record")

    return actionOk("แก้ไขบันทึกพฤติกรรมสำเร็จ", {
      data: { id: record.id },
      redirectTo: `/behavior/${record.id}`,
      revalidated: [
        "/behavior",
        `/behavior/${record.id}`,
        `/behavior/${record.id}/edit`,
        "/behavior/record",
      ],
    })
  } catch (error) {
    return actionFailureFromError(error, "ไม่สามารถแก้ไขบันทึกพฤติกรรมได้")
  }
}
