"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import {
  RISK_WEIGHT_DEFAULTS,
  RISK_WEIGHT_FACTOR_KEYS,
  RISK_WEIGHT_LABELS,
  type RiskWeightFactorKey,
} from "@/lib/risk-weight-constants"

const uuidSchema = z.string().uuid("รหัสไม่ถูกต้อง")

const riskRecalculateAllowedRoles = new Set(["admin", "director", "counselor", "homeroom_teacher"])
const riskRecalculateAllAllowedRoles = new Set(["admin", "director"])

export type RecalculatedRiskData = {
  studentId: string
  semesterId: string
  assessmentId: string
  overallScore: number
  riskLevel: string
  attendanceRate: number
  behaviorPoints: number
  failingGrades: number
  openSupportCases: number
}

/**
 * Recalculate risk score and explainable signals for a specific student using the database RPC.
 */
export async function recalculateStudentRiskAction(
  studentId: string,
  semesterId?: string,
): Promise<ActionResult<RecalculatedRiskData>> {
  try {
    const studentParsed = uuidSchema.safeParse(studentId)
    if (!studentParsed.success) {
      return actionFail("VALIDATION_ERROR", "รหัสนักเรียนไม่ถูกต้อง")
    }

    const context = await getCurrentUserContext()
    if (!context.profileId || !context.schoolId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (!riskRecalculateAllowedRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ประมวลผลความเสี่ยงนักเรียน")
    }

    const targetSemesterId = semesterId || (await getCurrentSemesterId(context.schoolId))
    if (!targetSemesterId) {
      return actionFail("NOT_FOUND", "ไม่พบภาคการศึกษาปัจจุบัน")
    }

    const supabase = await createClient()
    const { data, error } = await supabase.rpc("recalculate_student_risk_signals", {
      p_student_id: studentParsed.data,
      p_semester_id: targetSemesterId,
    })

    if (error) {
      console.error("recalculate_student_risk_signals error:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถประมวลผลความเสี่ยงได้ กรุณาลองใหม่")
    }

    const result = data as unknown as RecalculatedRiskData

    revalidatePath("/risk-analysis")
    revalidatePath(`/students/${studentId}`)

    return actionOk("ประมวลผลสัญญาณความเสี่ยงเรียบร้อยแล้ว", {
      data: result,
      revalidated: ["/risk-analysis", `/students/${studentId}`],
    })
  } catch (err) {
    console.error("recalculateStudentRiskAction exception:", err)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการประมวลผลความเสี่ยง")
  }
}

/**
 * Legacy compatibility wrapper calling the RPC.
 */
export async function calculateRiskScore(studentId: string) {
  const res = await recalculateStudentRiskAction(studentId)
  if (!res.ok || !res.data) {
    return { success: false, score: 0, level: "normal" }
  }
  return {
    success: true,
    score: res.data.overallScore,
    level: res.data.riskLevel,
  }
}

/**
 * Recalculate risk scores for all active students in the school.
 */
export async function recalculateAllRiskScores(): Promise<{ success: boolean; processedCount?: number; error?: string }> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId || !context.profileId) {
      return { success: false, error: "Unauthorized" }
    }

    if (!riskRecalculateAllAllowedRoles.has(context.role)) {
      return { success: false, error: "Forbidden" }
    }

    const targetSemesterId = await getCurrentSemesterId(context.schoolId)
    if (!targetSemesterId) {
      return { success: false, error: "No active semester" }
    }

    const supabase = await createClient()
    const { data: students, error } = await supabase
      .from("students")
      .select("id")
      .eq("school_id", context.schoolId)
      .eq("status", "active")

    if (error || !students) {
      return { success: false, error: "Could not fetch students" }
    }

    for (const student of students) {
      await supabase.rpc("recalculate_student_risk_signals", {
        p_student_id: student.id,
        p_semester_id: targetSemesterId,
      })
    }

    revalidatePath("/risk-analysis")
    return { success: true, processedCount: students.length }
  } catch (err) {
    console.error("recalculateAllRiskScores error:", err)
    return { success: false, error: "Failed to recalculate risk scores" }
  }
}

export async function getRiskAssessments() {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  if (!context.schoolId) {
    return []
  }

  const { data, error } = await supabase
    .from("risk_assessments")
    .select(`
      id,
      risk_score,
      risk_level,
      student_id,
      students (
        id,
        first_name,
        last_name,
        student_code
      )
    `)
    .eq("school_id", context.schoolId)
    .order("risk_score", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data
}

export type { RiskWeightFactorKey }

const riskWeightKeySet = new Set<string>(RISK_WEIGHT_FACTOR_KEYS)
const weightManagerRoles = new Set(["admin", "director"])

export type RiskWeightItem = {
  factorKey: string
  label: string
  weight: number
}

export async function getRiskWeightsAction(): Promise<ActionResult<RiskWeightItem[]>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดูน้ำหนักความเสี่ยง")

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("risk_weights")
      .select("factor_key, weight")
      .eq("school_id", context.schoolId)

    if (error) {
      console.error("Risk weights load failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถโหลดน้ำหนักความเสี่ยงได้")
    }

    const byKey = new Map((data ?? []).map((row) => [row.factor_key, row.weight]))
    const items: RiskWeightItem[] = RISK_WEIGHT_FACTOR_KEYS.map((key) => ({
      factorKey: key,
      label: RISK_WEIGHT_LABELS[key],
      weight: byKey.get(key) ?? RISK_WEIGHT_DEFAULTS[key] ?? 0,
    }))

    return actionOk("โหลดน้ำหนักความเสี่ยงเรียบร้อยแล้ว", { data: items })
  } catch (error) {
    console.error("Risk weights action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถโหลดน้ำหนักความเสี่ยงได้")
  }
}

export async function updateRiskWeightsAction(
  weights: Array<{ factor_key: string; weight: number }>,
): Promise<ActionResult<{ count: number }>> {
  try {
    const context = await getCurrentUserContext()
    if (!weightManagerRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "เฉพาะผู้บริหารที่ปรับน้ำหนักความเสี่ยงได้")
    }
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนบันทึก")
    if (!weights.length) return actionFail("VALIDATION_ERROR", "ไม่มีข้อมูลน้ำหนักให้บันทึก")

    const invalid = weights.some(
      (item) =>
        !riskWeightKeySet.has(item.factor_key) ||
        !Number.isInteger(item.weight) ||
        item.weight < 0 ||
        item.weight > 100,
    )
    if (invalid) {
      return actionFail("VALIDATION_ERROR", "น้ำหนักต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 100")
    }

    const supabase = await createClient()
    const payload = weights.map((item) => ({
      school_id: context.schoolId,
      factor_key: item.factor_key,
      weight: item.weight,
      updated_by: context.profileId,
    }))

    const { error } = await supabase
      .from("risk_weights")
      .upsert(payload, { onConflict: "school_id,factor_key" })

    if (error) {
      console.error("Risk weights save failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกน้ำหนักได้ กรุณาลองใหม่")
    }

    revalidatePath("/risk-analysis")
    return actionOk("บันทึกน้ำหนักความเสี่ยงเรียบร้อยแล้ว การคำนวณครั้งถัดไปจะใช้น้ำหนักใหม่", {
      data: { count: payload.length },
      revalidated: ["/risk-analysis"],
    })
  } catch (error) {
    console.error("Risk weights update failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกน้ำหนักได้ กรุณาลองใหม่")
  }
}
