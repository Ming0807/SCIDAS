"use server"

import { revalidatePath } from "next/cache"

import type { Database } from "@/types/database.types"
import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { logAudit } from "@/lib/server/audit-logger"
import { createClient } from "@/utils/supabase/server"
import { SKILL_LEVELS, type SkillLevel } from "@/lib/basic-skills-constants"

export type BasicSkillInput = {
  student_id: string
  reading_level: SkillLevel
  reading_score?: number | null
  writing_level: SkillLevel
  writing_score?: number | null
  math_level: SkillLevel
  math_score?: number | null
  remark?: string | null
}

type BasicSkillInsert = Database["public"]["Tables"]["basic_skills"]["Insert"]

const editableRoles = new Set(["admin", "homeroom_teacher", "subject_teacher", "counselor"])
const skillLevelSet = new Set<string>(SKILL_LEVELS)

function isValidScore(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
}

function toNullableScore(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  return value
}

export async function upsertBasicSkills(
  semesterId: string,
  records: BasicSkillInput[],
): Promise<ActionResult<{ count: number }>> {
  try {
    const context = await getCurrentUserContext()
    if (!editableRoles.has(context.role)) return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกทักษะพื้นฐาน")
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนบันทึกทักษะพื้นฐาน")
    if (!semesterId) return actionFail("VALIDATION_ERROR", "กรุณาเลือกภาคเรียน")
    if (!records.length) return actionFail("VALIDATION_ERROR", "ไม่มีข้อมูลทักษะให้บันทึก")

    const invalid = records.some(
      (record) =>
        !record.student_id ||
        !skillLevelSet.has(record.reading_level) ||
        !skillLevelSet.has(record.writing_level) ||
        !skillLevelSet.has(record.math_level) ||
        !isValidScore(record.reading_score) ||
        !isValidScore(record.writing_score) ||
        !isValidScore(record.math_score),
    )
    if (invalid) {
      return actionFail(
        "VALIDATION_ERROR",
        "ระดับทักษะต้องเป็น ดีมาก/ดี/พอใช้/ปรับปรุง/ไม่ผ่าน และคะแนนต้องอยู่ระหว่าง 0-100",
      )
    }

    const studentIds = [...new Set(records.map((record) => record.student_id))]
    const supabase = await createClient()

    const [{ data: semester }, { data: students }] = await Promise.all([
      supabase
        .from("semesters")
        .select("id")
        .eq("id", semesterId)
        .eq("school_id", context.schoolId)
        .maybeSingle(),
      supabase.from("students").select("id").eq("school_id", context.schoolId).in("id", studentIds),
    ])

    if (!semester) return actionFail("NOT_FOUND", "ไม่พบภาคการศึกษาในโรงเรียนของคุณ")
    if ((students ?? []).length !== studentIds.length) {
      return actionFail("FORBIDDEN", "มีนักเรียนที่ไม่อยู่ในโรงเรียนของคุณ")
    }

    const payload: BasicSkillInsert[] = records.map((record) => ({
      school_id: context.schoolId,
      student_id: record.student_id,
      semester_id: semesterId,
      reading_level: record.reading_level,
      reading_score: toNullableScore(record.reading_score),
      writing_level: record.writing_level,
      writing_score: toNullableScore(record.writing_score),
      math_level: record.math_level,
      math_score: toNullableScore(record.math_score),
      assessed_by: context.profileId!,
      remark: record.remark?.trim() || null,
    }))

    const { error } = await supabase
      .from("basic_skills")
      .upsert(payload, { onConflict: "student_id,semester_id" })

    if (error) {
      console.error("Basic skills save failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกทักษะพื้นฐานได้ กรุณาลองใหม่")
    }

    revalidatePath("/academics")
    logAudit({
      action: "INSERT",
      tableName: "basic_skills",
      schoolId: context.schoolId,
      userId: context.userId,
      newData: { semesterId, count: payload.length },
    }).catch(() => {})
    return actionOk("บันทึกทักษะพื้นฐานเรียบร้อยแล้ว", {
      data: { count: payload.length },
      revalidated: ["/academics"],
    })
  } catch (error) {
    console.error("Basic skills action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกทักษะพื้นฐานได้ กรุณาลองใหม่")
  }
}
