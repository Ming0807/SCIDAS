"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

const TEACHER_FLAG_KEY = "teacher_flagged"

const flaggableRoles = new Set(["admin", "homeroom_teacher", "counselor"])

export type TeacherFlagState = {
  flagged: boolean
  reason: string | null
  flaggedAt: string | null
}

export async function getTeacherFlag(studentId: string): Promise<TeacherFlagState> {
  const fallback: TeacherFlagState = { flagged: false, reason: null, flaggedAt: null }
  if (!studentId) return fallback
  try {
    const context = await getCurrentUserContext()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("student_flags")
      .select("description, created_at")
      .eq("school_id", context.schoolId)
      .eq("student_id", studentId)
      .eq("flag_key", TEACHER_FLAG_KEY)
      .eq("status", "active")
      .maybeSingle()
    if (error || !data) return fallback
    return { flagged: true, reason: data.description, flaggedAt: data.created_at }
  } catch {
    return fallback
  }
}

export async function setTeacherFlagAction(input: {
  student_id: string
  reason: string
}): Promise<ActionResult<{ studentId: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!flaggableRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ติดตามนักเรียน")
    }
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนติดตามนักเรียน")
    if (!input.student_id) return actionFail("VALIDATION_ERROR", "ไม่พบรหัสนักเรียน")
    const reason = input.reason?.trim()
    if (!reason) return actionFail("VALIDATION_ERROR", "กรุณาระบุเหตุผลที่ควรติดตาม")
    if (reason.length > 500) return actionFail("VALIDATION_ERROR", "เหตุผลต้องไม่เกิน 500 ตัวอักษร")

    const supabase = await createClient()
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("id", input.student_id)
      .eq("school_id", context.schoolId)
      .maybeSingle()
    if (!student) return actionFail("NOT_FOUND", "ไม่พบนักเรียนในโรงเรียนของคุณ")

    const { error } = await supabase.from("student_flags").upsert(
      {
        school_id: context.schoolId,
        student_id: input.student_id,
        flag_key: TEACHER_FLAG_KEY,
        label: "ครูระบุว่าควรติดตาม",
        description: reason,
        severity: "high",
        status: "active",
        created_by: context.profileId,
        owner_id: context.profileId,
        resolved_at: null,
        resolved_by: null,
      },
      { onConflict: "school_id,student_id,flag_key" },
    )

    if (error) {
      console.error("Teacher flag save failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถติดตามนักเรียนได้ กรุณาลองใหม่")
    }

    const paths = ["/", "/risk-analysis", `/students/${input.student_id}`]
    for (const path of paths) revalidatePath(path)
    return actionOk("ติดตามนักเรียนเรียบร้อยแล้ว", {
      data: { studentId: input.student_id },
      revalidated: paths,
    })
  } catch (error) {
    console.error("Teacher flag action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถติดตามนักเรียนได้ กรุณาลองใหม่")
  }
}

export async function clearTeacherFlagAction(input: {
  student_id: string
}): Promise<ActionResult<{ studentId: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!flaggableRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ยกเลิกการติดตาม")
    }
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนยกเลิกการติดตาม")
    if (!input.student_id) return actionFail("VALIDATION_ERROR", "ไม่พบรหัสนักเรียน")

    const supabase = await createClient()
    const { error } = await supabase
      .from("student_flags")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: context.profileId,
      })
      .eq("school_id", context.schoolId)
      .eq("student_id", input.student_id)
      .eq("flag_key", TEACHER_FLAG_KEY)
      .eq("status", "active")

    if (error) {
      console.error("Teacher flag clear failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถยกเลิกการติดตามได้ กรุณาลองใหม่")
    }

    const paths = ["/", "/risk-analysis", `/students/${input.student_id}`]
    for (const path of paths) revalidatePath(path)
    return actionOk("ยกเลิกการติดตามเรียบร้อยแล้ว", {
      data: { studentId: input.student_id },
      revalidated: paths,
    })
  } catch (error) {
    console.error("Teacher flag clear action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถยกเลิกการติดตามได้ กรุณาลองใหม่")
  }
}
