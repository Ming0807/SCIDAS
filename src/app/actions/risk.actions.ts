"use server"

import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "@/lib/server/current-user"

export async function calculateRiskScore(studentId: string) {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  if (!context.schoolId || !context.profileId) {
    throw new Error("Unauthorized — no school assigned")
  }

  // Verify student belongs to current school
  const { data: student } = await supabase
    .from("students")
    .select("school_id")
    .eq("id", studentId)
    .eq("school_id", context.schoolId)
    .maybeSingle()

  if (!student) {
    throw new Error("Student not found or not in your school")
  }

  // Get current semester scoped to school
  const { data: semData } = await supabase
    .from("semesters")
    .select("id")
    .eq("school_id", context.schoolId)
    .eq("is_current", true)
    .maybeSingle()

  let semester_id = semData?.id
  if (!semester_id) {
    const { data: fallbackSem } = await supabase
      .from("semesters")
      .select("id")
      .eq("school_id", context.schoolId)
      .limit(1)
      .maybeSingle()
    semester_id = fallbackSem?.id
  }
  if (!semester_id) throw new Error("No semester found")

  // 1. Total Absences
  const { count: absencesCount } = await supabase
    .from("attendance_records")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("school_id", context.schoolId)
    .eq("status", "absent")
  const totalAbsences = absencesCount || 0

  // 2. Low Grades
  const { count: lowGradesCount } = await supabase
    .from("academic_scores")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("school_id", context.schoolId)
    .lt("grade_point", 2.0)
  const totalLowGrades = lowGradesCount || 0

  // 3. Negative Behavior
  const { count: negativeBehaviorCount } = await supabase
    .from("behavior_records")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("school_id", context.schoolId)
    .eq("behavior_type", "negative")
  const totalNegativeBehaviors = negativeBehaviorCount || 0

  // Calculate score
  let score = 0
  score += totalAbsences * 20
  score += totalLowGrades * 20
  score += totalNegativeBehaviors * 15

  if (score > 100) score = 100

  // Determine Level
  let level: 'normal' | 'watch' | 'high' = 'normal'
  if (score >= 61) level = 'high'
  else if (score >= 31) level = 'watch'

  // Upsert risk_assessments — scoped to school
  const { data: existingAssessment } = await supabase
    .from("risk_assessments")
    .select("id")
    .eq("student_id", studentId)
    .eq("semester_id", semester_id)
    .eq("school_id", context.schoolId)
    .maybeSingle()

  let assessmentId = existingAssessment?.id

  if (assessmentId) {
    await supabase
      .from("risk_assessments")
      .update({
        risk_score: score,
        risk_level: level,
        assessed_by: context.profileId,
        assessed_at: new Date().toISOString(),
      })
      .eq("id", assessmentId)
      .eq("school_id", context.schoolId)
  } else {
    const { data: newAssessment } = await supabase
      .from("risk_assessments")
      .insert({
        school_id: context.schoolId,
        student_id: studentId,
        semester_id: semester_id,
        risk_score: score,
        risk_level: level,
        assessed_by: context.profileId,
      })
      .select("id")
      .single()
    assessmentId = newAssessment?.id
  }

  // Handle risk_factors
  if (assessmentId) {
    await supabase
      .from("risk_factors")
      .delete()
      .eq("risk_assessment_id", assessmentId)
      .eq("school_id", context.schoolId)

    const factorsToInsert = []
    if (totalAbsences > 0) {
      factorsToInsert.push({
        school_id: context.schoolId,
        risk_assessment_id: assessmentId,
        factor_key: "frequent_absences",
        factor_label: `Frequent Absences (${totalAbsences})`,
        score: totalAbsences * 20,
      })
    }
    if (totalLowGrades > 0) {
      factorsToInsert.push({
        school_id: context.schoolId,
        risk_assessment_id: assessmentId,
        factor_key: "low_grades",
        factor_label: `Low Grades (${totalLowGrades} subjects)`,
        score: totalLowGrades * 20,
      })
    }
    if (totalNegativeBehaviors > 0) {
      factorsToInsert.push({
        school_id: context.schoolId,
        risk_assessment_id: assessmentId,
        factor_key: "negative_behavior",
        factor_label: `Negative Behavior (${totalNegativeBehaviors} incidents)`,
        score: totalNegativeBehaviors * 15,
      })
    }

    if (factorsToInsert.length > 0) {
      await supabase.from("risk_factors").insert(factorsToInsert)
    }
  }

  return { success: true, score, level }
}

export async function recalculateAllRiskScores() {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  if (!context.schoolId) {
    return { success: false, error: "No school assigned" }
  }

  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", context.schoolId)

  if (!students) return { success: false }

  for (const s of students) {
    await calculateRiskScore(s.id)
  }
  return { success: true }
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
