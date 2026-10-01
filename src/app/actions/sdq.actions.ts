"use server"

import { revalidatePath } from "next/cache"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"
import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"
import {
  calculateSdqScores,
  type SdqClassification,
  type SdqEvaluatorType,
  type SdqResultSummary,
} from "@/lib/sdq-constants"
import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

type RiskLevel = Database["public"]["Enums"]["risk_level"]

export interface SdqActionResponse {
  assessmentId: string
  classification: SdqClassification
  totalScore: number
  summary: SdqResultSummary
}

export async function saveSdqAssessmentAction(
  _prev: ActionResult<SdqActionResponse> | null,
  formData: FormData
): Promise<ActionResult<SdqActionResponse>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId || context.role === "student") {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกแบบประเมิน SDQ")
    }

    const studentId = String(formData.get("student_id") ?? "").trim()
    const evaluatorType = (String(formData.get("evaluator_type") ?? "teacher").trim()) as SdqEvaluatorType

    if (!studentId) {
      return actionFail("VALIDATION_ERROR", "ไม่พบรหัสนักเรียน")
    }

    // Extract 25 answers
    const answers: Record<number, number> = {}
    for (let i = 1; i <= 25; i++) {
      const val = formData.get(`q_${i}`)
      if (val === null || val === undefined || val === "") {
        return actionFail("VALIDATION_ERROR", `กรุณาตอบคำถามข้อที่ ${i} ให้ครบถ้วน`, {
          fieldErrors: { [`q_${i}`]: ["กรุณาตอบคำถามข้อนี้"] },
        })
      }
      answers[i] = Number(val)
    }

    const sdqResult = calculateSdqScores(answers)

    // Map SDQ classification to database risk_level
    let riskLevel: RiskLevel = "normal"
    if (sdqResult.overallClassification === "risk") {
      riskLevel = "watch"
    } else if (sdqResult.overallClassification === "problem") {
      riskLevel = "high"
    }

    const semesterId = await getCurrentSemesterId(context.schoolId)
    const client = await createClient()

    // Generate recommendation note
    const problemDimensions = Object.entries(sdqResult.dimensionClassifications)
      .filter(([, c]) => c === "problem" || c === "risk")
      .map(([dim]) => dim)

    const summaryText = `แบบประเมิน SDQ (${evaluatorType}): คะแนนรวม ${sdqResult.totalDifficultiesScore}/40 (ระดับ: ${sdqResult.overallClassification})`
    const recommendationsText =
      problemDimensions.length > 0
        ? `พบแนวโน้มความเสี่ยงในมิติ: ${problemDimensions.join(", ")} ควรจัดกิจกรรมส่งเสริมพฤติกรรมและติดตามอาการ`
        : "นักเรียนมีพัฒนาการทางอารมณ์และสังคมอยู่ในเกณฑ์ปกติ"

    // Insert risk assessment
    const { data: assessment, error: assessError } = await client
      .from("risk_assessments")
      .insert({
        student_id: studentId,
        school_id: context.schoolId,
        semester_id: semesterId ?? "default-semester",
        assessed_by: context.profileId,
        risk_level: riskLevel,
        risk_score: sdqResult.totalDifficultiesScore,
        summary: summaryText,
        recommendations: recommendationsText,
        assessed_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (assessError) {
      console.error("Failed to insert SDQ risk assessment:", assessError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกผลการประเมินได้")
    }

    // If risk or problem, log a student flag (upsert: re-assessments refresh it).
    if (sdqResult.overallClassification !== "normal") {
      const { error: flagError } = await client.from("student_flags").upsert(
        {
          student_id: studentId,
          school_id: context.schoolId,
          flag_key: sdqResult.overallClassification === "problem" ? "sdq_problem" : "sdq_risk",
          label: `SDQ แจ้งเตือน: ${sdqResult.overallClassification === "problem" ? "กลุ่มมีปัญหา" : "กลุ่มเสี่ยง"}`,
          severity: sdqResult.overallClassification === "problem" ? "high" : "medium",
          description: summaryText,
          status: "active",
          owner_id: context.profileId,
          created_by: context.profileId,
        },
        { onConflict: "school_id,student_id,flag_key" },
      )
      if (flagError) {
        console.error("Failed to upsert SDQ student flag:", flagError)
      }
    }

    revalidatePath("/screening/sdq")
    revalidatePath("/risk-analysis")
    revalidatePath(`/students/${studentId}`)

    return actionOk("บันทึกแบบประเมิน SDQ เรียบร้อยแล้ว", {
      data: {
        assessmentId: assessment.id,
        classification: sdqResult.overallClassification,
        totalScore: sdqResult.totalDifficultiesScore,
        summary: sdqResult,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการประเมิน SDQ"
    return actionFail("INTERNAL_ERROR", msg)
  }
}

export type SdqHistoryItem = {
  id: string
  studentId: string
  assessmentDate: string | null
  riskLevel: RiskLevel
  riskScore: number | null
  summary: string | null
}

export async function getSdqAssessments(studentId: string): Promise<SdqHistoryItem[]> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId || context.role === "student") return []

    const client = await createClient()
    const { data: student } = await client
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("school_id", context.schoolId)
      .maybeSingle()
    if (!student) return []

    const { data, error } = await client
      .from("risk_assessments")
      .select("id, student_id, risk_level, risk_score, summary, assessed_at")
      .eq("school_id", context.schoolId)
      .eq("student_id", studentId)
      .ilike("summary", "แบบประเมิน SDQ%")
      .order("assessed_at", { ascending: false })
      .limit(20)

    if (error || !data) return []
    return data.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      assessmentDate: row.assessed_at,
      riskLevel: row.risk_level,
      riskScore: row.risk_score,
      summary: row.summary,
    }))
  } catch {
    return []
  }
}

export interface LatestSdqAssessment {
  id: string
  studentId: string
  riskLevel: "normal" | "watch" | "high"
  score: number
  summary: string
  assessedAt: string
}

export async function getLatestSchoolSdqAssessments(): Promise<Record<string, LatestSdqAssessment>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId || context.role === "student") return {}

    const client = await createClient()
    const { data, error } = await client
      .from("risk_assessments")
      .select("id, student_id, risk_level, risk_score, summary, assessed_at")
      .eq("school_id", context.schoolId)
      .ilike("summary", "แบบประเมิน SDQ%")
      .order("assessed_at", { ascending: false })

    if (error || !data) return {}

    const result: Record<string, LatestSdqAssessment> = {}
    for (const row of data) {
      if (!result[row.student_id]) {
        result[row.student_id] = {
          id: row.id,
          studentId: row.student_id,
          riskLevel: (row.risk_level as "normal" | "watch" | "high") ?? "normal",
          score: row.risk_score ?? 0,
          summary: row.summary ?? "",
          assessedAt: row.assessed_at,
        }
      }
    }
    return result
  } catch {
    return {}
  }
}

export async function deleteSdqAssessmentAction(
  assessmentId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId || context.role === "student" || context.role === "parent") {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ลบผลการประเมิน SDQ")
    }

    const client = await createClient()
    const { data: assessment } = await client
      .from("risk_assessments")
      .select("id, student_id, semester_id, assessed_by")
      .eq("id", assessmentId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (!assessment) return actionFail("NOT_FOUND", "ไม่พบผลการประเมิน")

    const canDelete =
      context.role === "admin" ||
      context.role === "director" ||
      context.role === "counselor" ||
      assessment.assessed_by === context.profileId

    if (!canDelete) {
      return actionFail(
        "FORBIDDEN",
        "คุณสามารถลบได้เฉพาะผลการประเมินที่คุณเป็นผู้บันทึก หรือติดต่อครูแนะแนว/ผู้ดูแลระบบ",
      )
    }

    const studentId = assessment.student_id as string

    const { error: deleteError } = await client
      .from("risk_assessments")
      .delete()
      .eq("id", assessmentId)
      .eq("school_id", context.schoolId)

    if (deleteError) {
      console.error("Failed to delete SDQ assessment:", deleteError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถลบผลการประเมินได้")
    }

    // If no concerning SDQ result remains, resolve the SDQ flags.
    const { data: remaining } = await client
      .from("risk_assessments")
      .select("id")
      .eq("school_id", context.schoolId)
      .eq("student_id", studentId)
      .ilike("summary", "แบบประเมิน SDQ%")
      .neq("risk_level", "normal")
      .limit(1)

    if (!remaining || remaining.length === 0) {
      await client
        .from("student_flags")
        .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: context.profileId })
        .eq("school_id", context.schoolId)
        .eq("student_id", studentId)
        .in("flag_key", ["sdq_risk", "sdq_problem"])
        .eq("status", "active")
    }

    revalidatePath("/screening/sdq")
    revalidatePath(`/screening/sdq/${studentId}`)
    revalidatePath(`/students/${studentId}`)
    return actionOk("ลบผลการประเมินเรียบร้อยแล้ว", { data: { id: assessmentId } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบผลการประเมิน"
    return actionFail("INTERNAL_ERROR", msg)
  }
}
