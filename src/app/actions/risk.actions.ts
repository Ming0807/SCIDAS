"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

const uuidSchema = z.string().uuid("รหัสไม่ถูกต้อง")

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
      overall_score,
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
    .order("overall_score", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data
}
