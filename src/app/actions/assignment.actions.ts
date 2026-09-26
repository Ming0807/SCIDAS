"use server"

import { revalidatePath } from "next/cache"

import type { Database } from "@/types/database.types"
import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/assignment-constants"

export type CreateAssignmentInput = {
  classroom_subject_id: string
  title: string
  description?: string | null
  assigned_date?: string
  due_date: string
  max_score?: number | null
  student_ids: string[]
}

type AssignmentInsert = Database["public"]["Tables"]["assignment_submissions"]["Insert"]

const editableRoles = new Set(["admin", "homeroom_teacher", "subject_teacher", "counselor"])
const statusSet = new Set<string>(SUBMISSION_STATUSES)

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

export async function createAssignmentAction(
  input: CreateAssignmentInput,
): Promise<ActionResult<{ count: number }>> {
  try {
    const context = await getCurrentUserContext()
    if (!editableRoles.has(context.role)) return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์มอบหมายงาน")
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนมอบหมายงาน")
    if (!input.classroom_subject_id) return actionFail("VALIDATION_ERROR", "กรุณาเลือกวิชา")
    if (!input.title?.trim()) return actionFail("VALIDATION_ERROR", "กรุณาระบุชื่องาน")
    if (!isValidDate(input.due_date)) return actionFail("VALIDATION_ERROR", "วันกำหนดส่งไม่ถูกต้อง (ปปปป-ดด-วว)")
    if (input.assigned_date && !isValidDate(input.assigned_date)) {
      return actionFail("VALIDATION_ERROR", "วันที่มอบหมายไม่ถูกต้อง (ปปปป-ดด-วว)")
    }
    if (!input.student_ids.length) return actionFail("VALIDATION_ERROR", "กรุณาเลือกนักเรียนอย่างน้อย 1 คน")
    if (
      input.max_score !== null &&
      input.max_score !== undefined &&
      (!Number.isFinite(input.max_score) || input.max_score <= 0 || input.max_score > 1000)
    ) {
      return actionFail("VALIDATION_ERROR", "คะแนนเต็มต้องอยู่ระหว่าง 1-1000")
    }

    const supabase = await createClient()

    const [{ data: subject }, { data: students }] = await Promise.all([
      supabase
        .from("classroom_subjects")
        .select("id, teacher_id")
        .eq("id", input.classroom_subject_id)
        .eq("school_id", context.schoolId)
        .maybeSingle(),
      supabase
        .from("students")
        .select("id")
        .eq("school_id", context.schoolId)
        .in("id", input.student_ids),
    ])

    if (!subject) return actionFail("NOT_FOUND", "ไม่พบวิชาในโรงเรียนของคุณ")
    if (context.role === "subject_teacher" && subject.teacher_id !== context.profileId) {
      return actionFail("FORBIDDEN", "คุณมอบหมายงานได้เฉพาะวิชาที่รับผิดชอบ")
    }
    if ((students ?? []).length !== input.student_ids.length) {
      return actionFail("FORBIDDEN", "มีนักเรียนที่ไม่อยู่ในโรงเรียนของคุณ")
    }

    const payload: AssignmentInsert[] = input.student_ids.map((studentId) => ({
      school_id: context.schoolId,
      student_id: studentId,
      classroom_subject_id: input.classroom_subject_id,
      assignment_title: input.title.trim(),
      assignment_description: input.description?.trim() || null,
      assigned_date: input.assigned_date ?? new Date().toISOString().slice(0, 10),
      due_date: input.due_date,
      status: "not_submitted",
      max_score: input.max_score ?? null,
      assigned_by: context.profileId!,
    }))

    const { error } = await supabase.from("assignment_submissions").insert(payload)
    if (error) {
      console.error("Assignment create failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถมอบหมายงานได้ กรุณาลองใหม่")
    }

    revalidatePath("/behavior")
    return actionOk("มอบหมายงานเรียบร้อยแล้ว", {
      data: { count: payload.length },
      revalidated: ["/behavior"],
    })
  } catch (error) {
    console.error("Assignment create action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถมอบหมายงานได้ กรุณาลองใหม่")
  }
}

export async function updateSubmissionStatusAction(input: {
  id: string
  status: SubmissionStatus
  submitted_date?: string | null
  score?: number | null
  feedback?: string | null
}): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!editableRoles.has(context.role)) return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกการส่งงาน")
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนบันทึกการส่งงาน")
    if (!statusSet.has(input.status)) return actionFail("VALIDATION_ERROR", "สถานะการส่งงานไม่ถูกต้อง")
    if (input.submitted_date !== undefined && input.submitted_date !== null && !isValidDate(input.submitted_date)) {
      return actionFail("VALIDATION_ERROR", "วันที่ส่งไม่ถูกต้อง (ปปปป-ดด-วว)")
    }
    if (
      input.score !== null &&
      input.score !== undefined &&
      (!Number.isFinite(input.score) || input.score < 0 || input.score > 1000)
    ) {
      return actionFail("VALIDATION_ERROR", "คะแนนต้องอยู่ระหว่าง 0-1000")
    }

    const supabase = await createClient()
    const { data: existing, error: fetchError } = await supabase
      .from("assignment_submissions")
      .select("id, classroom_subject_id, classroom_subjects!inner(teacher_id)")
      .eq("id", input.id)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (fetchError) {
      console.error("Assignment fetch failed", fetchError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถโหลดข้อมูลงานได้")
    }
    if (!existing) return actionFail("NOT_FOUND", "ไม่พบงานที่ระบุ")

    type ExistingRow = {
      id: string
      classroom_subject_id: string
      classroom_subjects: { teacher_id: string | null } | Array<{ teacher_id: string | null }> | null
    }
    const cs = (existing as ExistingRow).classroom_subjects
    const ownerId = Array.isArray(cs) ? (cs[0]?.teacher_id ?? null) : (cs?.teacher_id ?? null)
    if (context.role === "subject_teacher" && ownerId !== context.profileId) {
      return actionFail("FORBIDDEN", "คุณบันทึกได้เฉพาะงานในวิชาที่รับผิดชอบ")
    }

    const patch: Database["public"]["Tables"]["assignment_submissions"]["Update"] = {
      status: input.status,
      submitted_date: input.submitted_date ?? (input.status === "not_submitted" ? null : undefined),
      score: input.score ?? null,
      feedback: input.feedback?.trim() || null,
    }
    // Remove undefined keys so they are not sent
    for (const key of Object.keys(patch) as Array<keyof typeof patch>) {
      if (patch[key] === undefined) delete patch[key]
    }

    const { error } = await supabase
      .from("assignment_submissions")
      .update(patch)
      .eq("id", input.id)
      .eq("school_id", context.schoolId)

    if (error) {
      console.error("Assignment status update failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกการส่งงานได้ กรุณาลองใหม่")
    }

    revalidatePath("/behavior")
    return actionOk("บันทึกการส่งงานเรียบร้อยแล้ว", {
      data: { id: input.id },
      revalidated: ["/behavior"],
    })
  } catch (error) {
    console.error("Assignment status action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกการส่งงานได้ กรุณาลองใหม่")
  }
}
