import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "./current-user"
import { getStudentCareProfile } from "./student-care-read-models"
import type { Database } from "@/types/database.types"

export type SuggestedActionRuleId =
  | "ABSENCE_STREAK"
  | "REPEATED_BEHAVIOR"
  | "URGENT_HOME_VISIT"
  | "LOW_GPA"
  | "CRITICAL_RISK"

export type SuggestedActionPriority = "low" | "medium" | "high" | "critical"

export type SuggestedActionItem = {
  ruleId: SuggestedActionRuleId
  title: string
  description: string
  category: "attendance" | "behavior" | "academic" | "support" | "family"
  priority: SuggestedActionPriority
  suggestedActionType: "action_item" | "support_record" | "idp"
  supportType?: Database["public"]["Enums"]["support_type"]
  reason: string
  actionHref: string
}

export type RiskSignalInput = {
  studentId: string
  studentName?: string
  absentDays30d: number
  attendanceRate30d: number | null
  negativeBehaviorCount30d: number
  urgentHomeVisit: boolean
  urgentHomeVisitDetail?: string | null
  gpa: number | null
  riskLevel: "high" | "watch" | "normal" | null
  openSupportCount: number
  activePlanCount: number
  openActionCount: number
}

/**
 * Pure rule engine that evaluates risk signals and produces actionable intervention suggestions (E1).
 */
export function evaluateRiskActionRules(input: RiskSignalInput): SuggestedActionItem[] {
  const suggestions: SuggestedActionItem[] = []

  // 1. Absence streak (ขาดเรียนสะสม 30 วัน >= 3 วัน หรือ เวลาเรียน < 80%)
  if (
    input.absentDays30d >= 3 ||
    (input.attendanceRate30d !== null && input.attendanceRate30d < 80)
  ) {
    const isCritical =
      input.absentDays30d >= 5 ||
      (input.attendanceRate30d !== null && input.attendanceRate30d < 70)
    suggestions.push({
      ruleId: "ABSENCE_STREAK",
      title: "ติดตามการขาดเรียนต่อเนื่องและประสานผู้ปกครอง",
      description: `พบการขาดเรียน ${input.absentDays30d} วัน ในรอบ 30 วัน (${
        input.attendanceRate30d !== null
          ? `เวลาเรียน ${input.attendanceRate30d}%`
          : "เวลาเรียนต่ำกว่าเกณฑ์ 80%"
      }) เสี่ยงต่อการหมดสิทธิ์สอบ (มส.)`,
      category: "attendance",
      priority: isCritical ? "critical" : "high",
      suggestedActionType: "support_record",
      supportType: "family",
      reason: `ขาดเรียน ${input.absentDays30d} วันใน 30 วัน`,
      actionHref: `/support/new?studentId=${input.studentId}&supportType=family&title=${encodeURIComponent(
        "ติดตามการขาดเรียนต่อเนื่องและประสานผู้ปกครอง",
      )}`,
    })
  }

  // 2. Repeated negative behavior (มีบันทึกพฤติกรรมเชิงลบ >= 2 ครั้งใน 30 วัน)
  if (input.negativeBehaviorCount30d >= 2) {
    const isCritical = input.negativeBehaviorCount30d >= 3
    suggestions.push({
      ruleId: "REPEATED_BEHAVIOR",
      title: "วางแผนปรับพฤติกรรมเชิงบวกและให้คำปรึกษา",
      description: `มีบันทึกพฤติกรรมเชิงลบสะสม ${input.negativeBehaviorCount30d} ครั้งในช่วง 30 วัน ควรนัดครูแนะแนวและผู้ปกครองร่วมวางแนวทางช่วยเหลือ`,
      category: "behavior",
      priority: isCritical ? "critical" : "high",
      suggestedActionType: "support_record",
      supportType: "behavioral",
      reason: `พฤติกรรมเชิงลบ ${input.negativeBehaviorCount30d} ครั้งใน 30 วัน`,
      actionHref: `/support/new?studentId=${input.studentId}&supportType=behavioral&title=${encodeURIComponent(
        "แผนปรับพฤติกรรมเชิงบวกและให้คำปรึกษา",
      )}`,
    })
  }

  // 3. Urgent home visit
  if (input.urgentHomeVisit) {
    suggestions.push({
      ruleId: "URGENT_HOME_VISIT",
      title: "สงเคราะห์ครอบครัวและสวัสดิภาพเร่งด่วน",
      description:
        input.urgentHomeVisitDetail ||
        "ผลการเยี่ยมบ้านพบความเสี่ยงเร่งด่วนด้านสภาพแวดล้อมหรือความเป็นอยู่ ควรประสานทุนการศึกษาหรือสงเคราะห์ครอบครัว",
      category: "family",
      priority: "critical",
      suggestedActionType: "support_record",
      supportType: "financial",
      reason: "ผลการเยี่ยมบ้านพบความเสี่ยงเร่งด่วน",
      actionHref: `/support/new?studentId=${input.studentId}&supportType=financial&title=${encodeURIComponent(
        "สงเคราะห์ครอบครัวและสวัสดิภาพเร่งด่วน",
      )}`,
    })
  }

  // 4. Low GPA (< 1.50)
  if (input.gpa !== null && input.gpa > 0 && input.gpa < 1.5) {
    const isCritical = input.gpa < 1.0
    suggestions.push({
      ruleId: "LOW_GPA",
      title: "จัดแผนสอนซ่อมเสริมและพัฒนาผลสัมฤทธิ์ (IDP)",
      description: `ผลการเรียนเฉลี่ย (${input.gpa.toFixed(2)}) ต่ำกว่าเกณฑ์ 1.50 มีความเสี่ยงต่อการไม่ผ่านเกณฑ์การศึกษา`,
      category: "academic",
      priority: isCritical ? "critical" : "high",
      suggestedActionType: "idp",
      reason: `GPA ${input.gpa.toFixed(2)} ต่ำกว่า 1.50`,
      actionHref: `/development-plans/new?studentId=${input.studentId}`,
    })
  }

  // 5. Critical risk without care
  if (
    input.riskLevel === "high" &&
    input.openSupportCount === 0 &&
    input.activePlanCount === 0
  ) {
    suggestions.push({
      ruleId: "CRITICAL_RISK",
      title: "เปิดเคสดูแลช่วยเหลือนักเรียนกลุ่มเสี่ยงสูง",
      description:
        "นักเรียนอยู่ในกลุ่มเสี่ยงสูงจากการประเมิน แต่ยังไม่มีเคสช่วยเหลือหรือแผนพัฒนาที่กำลังดำเนินการ",
      category: "support",
      priority: "high",
      suggestedActionType: "support_record",
      supportType: "social",
      reason: "กลุ่มเสี่ยงสูงที่ยังไม่มีเคสดูแล",
      actionHref: `/support/new?studentId=${input.studentId}`,
    })
  }

  return suggestions
}

/**
 * Fetch a student's current signals and evaluate suggested actions.
 */
export async function getStudentRiskActionSuggestions(
  studentId: string,
): Promise<SuggestedActionItem[]> {
  const profile = await getStudentCareProfile(studentId)
  if (!profile) return []

  const context = await getCurrentUserContext()
  const client = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0]

  const [behaviorRes, homeVisitRes, scoresRes] = await Promise.all([
    client
      .from("behavior_records")
      .select("id", { count: "exact", head: true })
      .eq("school_id", context.schoolId)
      .eq("student_id", studentId)
      .eq("behavior_type", "negative")
      .gte("date", dateStr),
    client
      .from("home_visits")
      .select("follow_up_needed, has_family_problem, housing_condition, overall_assessment")
      .eq("school_id", context.schoolId)
      .eq("student_id", studentId)
      .order("visit_date", { ascending: false })
      .limit(1),
    client
      .from("academic_scores")
      .select("grade_point")
      .eq("school_id", context.schoolId)
      .eq("student_id", studentId)
      .not("grade_point", "is", null)
      .limit(30),
  ])

  const negativeBehaviorCount30d = behaviorRes.count ?? 0

  const latestVisit = homeVisitRes.data?.[0]
  const urgentHomeVisit = Boolean(
    latestVisit &&
      (latestVisit.follow_up_needed === true ||
        latestVisit.has_family_problem === true ||
        latestVisit.housing_condition === "poor" ||
        latestVisit.housing_condition === "critical"),
  )
  const urgentHomeVisitDetail = latestVisit?.overall_assessment ?? null

  let gpa: number | null = null
  const scores = scoresRes.data ?? []
  if (scores.length > 0) {
    const validScores = scores
      .map((s) => s.grade_point)
      .filter((gp): gp is number => typeof gp === "number")
    if (validScores.length > 0) {
      gpa =
        Math.round(
          (validScores.reduce((sum, gp) => sum + gp, 0) / validScores.length) * 100,
        ) / 100
    }
  }

  const input: RiskSignalInput = {
    studentId,
    studentName: profile.fullName,
    absentDays30d: profile.absentDays30d,
    attendanceRate30d: profile.attendanceRate30d,
    negativeBehaviorCount30d,
    urgentHomeVisit,
    urgentHomeVisitDetail,
    gpa,
    riskLevel: profile.riskLevel,
    openSupportCount: profile.openSupportCount,
    activePlanCount: profile.activePlanCount,
    openActionCount: profile.openActionCount,
  }

  return evaluateRiskActionRules(input)
}

export type SchoolRiskActionSummary = {
  absenceStreakCount: number
  repeatedBehaviorCount: number
  urgentHomeVisitCount: number
  lowGpaCount: number
  unassignedHighRiskCount: number
  totalSuggestedActions: number
}

/**
 * Aggregates school-wide or classroom-wide counts of students matching each risk-to-action rule.
 */
export async function getSchoolRiskActionSummary(
  classroomId?: string,
): Promise<SchoolRiskActionSummary> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0]

  // If classroomId provided, get student IDs in that classroom
  let targetStudentIds: string[] | null = null
  if (classroomId) {
    const { data: enrollments } = await client
      .from("classroom_students")
      .select("student_id")
      .eq("school_id", context.schoolId)
      .eq("classroom_id", classroomId)
      .eq("is_active", true)
    targetStudentIds = (enrollments ?? []).map((e) => e.student_id)
    if (targetStudentIds.length === 0) {
      return {
        absenceStreakCount: 0,
        repeatedBehaviorCount: 0,
        urgentHomeVisitCount: 0,
        lowGpaCount: 0,
        unassignedHighRiskCount: 0,
        totalSuggestedActions: 0,
      }
    }
  }

  let attendanceQuery = client
    .from("v_student_worklist")
    .select("student_id, absent_days_30d, attendance_rate_30d")
    .eq("school_id", context.schoolId)
    .or("absent_days_30d.gte.3,attendance_rate_30d.lt.80")

  let behaviorQuery = client
    .from("behavior_records")
    .select("student_id")
    .eq("school_id", context.schoolId)
    .eq("behavior_type", "negative")
    .gte("date", dateStr)

  let homeVisitQuery = client
    .from("home_visits")
    .select("student_id")
    .eq("school_id", context.schoolId)
    .or("follow_up_needed.eq.true,has_family_problem.eq.true,housing_condition.in.(poor,critical)")

  let academicQuery = client
    .from("academic_scores")
    .select("student_id, grade_point")
    .eq("school_id", context.schoolId)
    .not("grade_point", "is", null)

  let unassignedRiskQuery = client
    .from("v_student_worklist")
    .select("student_id")
    .eq("school_id", context.schoolId)
    .eq("risk_level", "high")
    .eq("open_support_count", 0)
    .eq("active_plan_count", 0)

  if (targetStudentIds) {
    attendanceQuery = attendanceQuery.in("student_id", targetStudentIds)
    behaviorQuery = behaviorQuery.in("student_id", targetStudentIds)
    homeVisitQuery = homeVisitQuery.in("student_id", targetStudentIds)
    academicQuery = academicQuery.in("student_id", targetStudentIds)
    unassignedRiskQuery = unassignedRiskQuery.in("student_id", targetStudentIds)
  }

  const [
    attendanceRes,
    behaviorRes,
    homeVisitRes,
    academicRes,
    unassignedRiskRes,
  ] = await Promise.all([
    attendanceQuery,
    behaviorQuery,
    homeVisitQuery,
    academicQuery,
    unassignedRiskQuery,
  ])

  const absenceStreakCount = new Set((attendanceRes.data ?? []).map((r) => r.student_id)).size

  // Group negative behavior by student to count those with >= 2
  const behaviorCountMap = new Map<string, number>()
  for (const row of behaviorRes.data ?? []) {
    behaviorCountMap.set(row.student_id, (behaviorCountMap.get(row.student_id) ?? 0) + 1)
  }
  let repeatedBehaviorCount = 0
  for (const count of behaviorCountMap.values()) {
    if (count >= 2) repeatedBehaviorCount++
  }

  const urgentHomeVisitCount = new Set((homeVisitRes.data ?? []).map((r) => r.student_id)).size

  // Group academic scores to compute GPA < 1.50
  const gpaMap = new Map<string, { total: number; count: number }>()
  for (const row of academicRes.data ?? []) {
    if (typeof row.grade_point === "number") {
      const entry = gpaMap.get(row.student_id) ?? { total: 0, count: 0 }
      entry.total += row.grade_point
      entry.count += 1
      gpaMap.set(row.student_id, entry)
    }
  }
  let lowGpaCount = 0
  for (const entry of gpaMap.values()) {
    if (entry.count > 0 && entry.total / entry.count < 1.5) {
      lowGpaCount++
    }
  }

  const unassignedHighRiskCount = new Set(
    (unassignedRiskRes.data ?? []).map((r) => r.student_id),
  ).size

  const totalSuggestedActions =
    absenceStreakCount +
    repeatedBehaviorCount +
    urgentHomeVisitCount +
    lowGpaCount +
    unassignedHighRiskCount

  return {
    absenceStreakCount,
    repeatedBehaviorCount,
    urgentHomeVisitCount,
    lowGpaCount,
    unassignedHighRiskCount,
    totalSuggestedActions,
  }
}
