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

    // If risk or problem, log a student flag
    if (sdqResult.overallClassification !== "normal") {
      await client.from("student_flags").insert({
        student_id: studentId,
        school_id: context.schoolId,
        flag_key: sdqResult.overallClassification === "problem" ? "sdq_problem" : "sdq_risk",
        label: `SDQ แจ้งเตือน: ${sdqResult.overallClassification === "problem" ? "กลุ่มมีปัญหา" : "กลุ่มเสี่ยง"}`,
        severity: sdqResult.overallClassification === "problem" ? "high" : "medium",
        description: summaryText,
        status: "open",
      })
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
