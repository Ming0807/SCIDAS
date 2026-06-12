import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext } from "./current-user"

type PlanStatus = Database["public"]["Enums"]["plan_status"]

export type DevelopmentPlanListItem = {
  id: string
  title: string
  status: PlanStatus
  studentName: string
  studentCode: string | null
  gradeLevel: string | null
  overallProgress: number
  startDate: string
  endDate: string | null
  creatorName: string | null
  createdAt: string
  goalCount: number
  completedGoalCount: number
}

const statusLabels: Record<PlanStatus, string> = {
  draft: "ฉบับร่าง",
  active: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
}

export function getPlanStatusLabel(status: PlanStatus): string {
  return statusLabels[status] ?? status
}

export function getPlanStatusTone(
  status: PlanStatus,
): "neutral" | "info" | "success" | "warning" | "danger" {
  switch (status) {
    case "active":
      return "info"
    case "completed":
      return "success"
    case "cancelled":
      return "danger"
    case "draft":
    default:
      return "neutral"
  }
}

export async function getDevelopmentPlanList(): Promise<DevelopmentPlanListItem[]> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()

  const { data, error } = await client
    .from("development_plans")
    .select(
      `
      id,
      title,
      status,
      overall_progress,
      start_date,
      end_date,
      created_at,
      students!development_plans_student_id_fkey (
        first_name,
        last_name,
        student_code
      ),
      creators:profiles!development_plans_created_by_fkey (
        first_name,
        last_name
      )
    `,
    )
    .eq("school_id", context.schoolId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(error.message)
  }

  // Count goals per plan in a single batch
  const planIds = (data ?? []).map((row) => row.id)

  const goalCountMap: Record<string, { total: number; completed: number }> = {}

  if (planIds.length > 0) {
    const { data: goals } = await client
      .from("development_goals")
      .select("id, plan_id, status")
      .in("plan_id", planIds)

    for (const goal of goals ?? []) {
      if (!goalCountMap[goal.plan_id]) {
        goalCountMap[goal.plan_id] = { total: 0, completed: 0 }
      }
      goalCountMap[goal.plan_id].total++
      if (goal.status === "achieved") {
        goalCountMap[goal.plan_id].completed++
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as Record<string, any>[]

  // Get grade_level from v_current_student_directory
  const studentIds = [...new Set(rows.map((r) => r.student_id as string))]
  const gradeMap = new Map<string, string>()
  if (studentIds.length > 0) {
    const { data: dirRows } = await client
      .from("v_current_student_directory")
      .select("student_id, grade_level")
      .in("student_id", studentIds)
      .eq("school_id", context.schoolId)
    for (const d of dirRows ?? []) {
      const dir = d as { student_id: string; grade_level: string | null }
      if (dir.grade_level) gradeMap.set(dir.student_id, dir.grade_level)
    }
  }

  return rows.map((row) => {
    const students = row.students as Record<string, unknown> | null | undefined
    const creators = row.creators as Record<string, unknown> | null | undefined

    const studentName = students
      ? `${(students.first_name as string) ?? ""} ${(students.last_name as string) ?? ""}`.trim()
      : "ไม่ทราบชื่อ"

    const creatorName = creators
      ? `${(creators.first_name as string) ?? ""} ${(creators.last_name as string) ?? ""}`.trim()
      : null

    const goals = goalCountMap[row.id as string] ?? { total: 0, completed: 0 }
    const sid = row.student_id as string

    return {
      id: row.id as string,
      title: row.title as string,
      status: row.status as PlanStatus,
      studentName: studentName || "ไม่ทราบชื่อ",
      studentCode: (students?.student_code as string) ?? null,
      gradeLevel: gradeMap.get(sid) ?? null,
      overallProgress: (row.overall_progress as number) ?? 0,
      startDate: row.start_date as string,
      endDate: (row.end_date as string) ?? null,
      creatorName,
      createdAt: row.created_at as string,
      goalCount: goals.total,
      completedGoalCount: goals.completed,
    }
  })
}

export type PlanSummary = {
  totalPlans: number
  activePlans: number
  completedPlans: number
  draftPlans: number
  cancelledPlans: number
  averageProgress: number
}

export async function getPlanSummary(): Promise<PlanSummary> {
  const plans = await getDevelopmentPlanList()

  let activePlans = 0
  let completedPlans = 0
  let draftPlans = 0
  let cancelledPlans = 0
  let totalProgress = 0

  for (const plan of plans) {
    switch (plan.status) {
      case "active":
        activePlans++
        break
      case "completed":
        completedPlans++
        break
      case "draft":
        draftPlans++
        break
      case "cancelled":
        cancelledPlans++
        break
    }
    totalProgress += plan.overallProgress
  }

  return {
    totalPlans: plans.length,
    activePlans,
    completedPlans,
    draftPlans,
    cancelledPlans,
    averageProgress:
      plans.length > 0 ? Math.round(totalProgress / plans.length) : 0,
  }
}
