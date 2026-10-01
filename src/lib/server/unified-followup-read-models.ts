import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "./current-user"

export type UnifiedFollowUpSourceType =
  | "action_item"
  | "support_followup"
  | "idp_goal"
  | "idp_plan"

export type UnifiedDueStatus = "overdue" | "due_today" | "due_soon" | "upcoming"

export type UnifiedFollowUpItem = {
  id: string
  sourceType: UnifiedFollowUpSourceType
  studentId: string | null
  studentName: string
  studentCode: string | null
  classroomName: string | null
  title: string
  detail: string | null
  dueDate: string // YYYY-MM-DD
  dueStatus: UnifiedDueStatus
  priority: "low" | "medium" | "high" | "critical"
  linkHref: string
}

export type UnifiedFollowUpMetrics = {
  overdueCount: number
  dueSoonCount: number
  totalDueCount: number
}

export function calculateDueStatus(
  dueDateStr: string,
  referenceDateStr?: string,
): UnifiedDueStatus {
  const todayStr =
    referenceDateStr ||
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date())

  if (dueDateStr < todayStr) return "overdue"
  if (dueDateStr === todayStr) return "due_today"

  // check if within 7 calendar days
  const today = new Date(todayStr)
  const limitDate = new Date(today)
  limitDate.setDate(limitDate.getDate() + 7)
  const limitDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
  }).format(limitDate)

  if (dueDateStr <= limitDateStr) return "due_soon"
  return "upcoming"
}

export type UnifiedFollowUpOptions = {
  studentId?: string
  sourceType?: UnifiedFollowUpSourceType
  limit?: number
}

/**
 * Unified follow-up inbox combining action_items, support_followups, and IDP goals/plans (E3).
 */
export async function getUnifiedFollowUpQueue(
  options: UnifiedFollowUpOptions = {},
): Promise<UnifiedFollowUpItem[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const [actionsRes, followupsRes, goalsRes, plansRes] = await Promise.all([
    client
      .from("action_items")
      .select("id, student_id, title, description, due_date, priority, status")
      .eq("school_id", context.schoolId)
      .in("status", ["todo", "in_progress"])
      .not("due_date", "is", null)
      .order("due_date", { ascending: true }),

    client
      .from("support_followups")
      .select(`
        id,
        next_followup_date,
        description,
        next_action,
        support_record:support_records!support_followups_support_record_id_fkey(
          id,
          student_id,
          title,
          status,
          priority
        )
      `)
      .eq("school_id", context.schoolId)
      .not("next_followup_date", "is", null)
      .order("next_followup_date", { ascending: true }),

    client
      .from("development_goals")
      .select(`
        id,
        target_date,
        title,
        description,
        status,
        plan:development_plans!development_goals_plan_id_fkey(
          id,
          student_id,
          title,
          status
        )
      `)
      .eq("school_id", context.schoolId)
      .not("target_date", "is", null)
      .eq("status", "in_progress")
      .order("target_date", { ascending: true }),

    client
      .from("development_plans")
      .select("id, student_id, title, end_date, status")
      .eq("school_id", context.schoolId)
      .in("status", ["draft", "active"])
      .not("end_date", "is", null)
      .order("end_date", { ascending: true }),
  ])

  type RawItem = {
    id: string
    sourceType: UnifiedFollowUpSourceType
    studentId: string | null
    title: string
    detail: string | null
    dueDate: string
    priority: "low" | "medium" | "high" | "critical"
    linkHref: string
  }

  const rawItems: RawItem[] = []

  // 1. Action items
  for (const a of actionsRes.data ?? []) {
    if (!a.due_date) continue
    rawItems.push({
      id: a.id,
      sourceType: "action_item",
      studentId: a.student_id,
      title: a.title,
      detail: a.description,
      dueDate: a.due_date,
      priority: a.priority ?? "medium",
      linkHref: a.student_id ? `/support?studentId=${a.student_id}` : "/support",
    })
  }

  // 2. Support followups (only if parent support record is pending or in_progress)
  for (const f of followupsRes.data ?? []) {
    const sr = Array.isArray(f.support_record) ? f.support_record[0] : f.support_record
    if (!sr || (sr.status !== "pending" && sr.status !== "in_progress") || !f.next_followup_date) {
      continue
    }
    rawItems.push({
      id: f.id,
      sourceType: "support_followup",
      studentId: sr.student_id,
      title: `นัดติดตามเคส: ${sr.title}`,
      detail: f.next_action || f.description,
      dueDate: f.next_followup_date,
      priority: sr.priority ?? "medium",
      linkHref: `/support/${sr.id}`,
    })
  }

  // 3. IDP Goals
  for (const g of goalsRes.data ?? []) {
    const pl = Array.isArray(g.plan) ? g.plan[0] : g.plan
    if (!pl || (pl.status !== "draft" && pl.status !== "active") || !g.target_date) {
      continue
    }
    rawItems.push({
      id: g.id,
      sourceType: "idp_goal",
      studentId: pl.student_id,
      title: `เป้าหมาย IDP: ${g.title}`,
      detail: g.description,
      dueDate: g.target_date,
      priority: "medium",
      linkHref: `/development-plans/${pl.id}`,
    })
  }

  // 4. IDP Plans review date
  for (const p of plansRes.data ?? []) {
    if (!p.end_date) continue
    rawItems.push({
      id: p.id,
      sourceType: "idp_plan",
      studentId: p.student_id,
      title: `ครบกำหนดทบทวนแผน IDP: ${p.title}`,
      detail: "ถึงกำหนดการประเมินและทบทวนแผนพัฒนารายบุคคล",
      dueDate: p.end_date,
      priority: "high",
      linkHref: `/development-plans/${p.id}`,
    })
  }

  // Filter by options
  let filtered = rawItems
  if (options.studentId) {
    filtered = filtered.filter((item) => item.studentId === options.studentId)
  }
  if (options.sourceType) {
    filtered = filtered.filter((item) => item.sourceType === options.sourceType)
  }

  // Sort by dueDate ascending (earliest due / most overdue first)
  filtered.sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  if (options.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit)
  }

  // Fetch student directory data
  const studentIds = Array.from(
    new Set(filtered.map((item) => item.studentId).filter((id): id is string => Boolean(id))),
  )

  const studentMap = new Map<
    string,
    { fullName: string; studentCode: string | null; classroomName: string | null }
  >()

  if (studentIds.length > 0) {
    const { data: dirRows } = await client
      .from("v_current_student_directory")
      .select("student_id, full_name, first_name, last_name, student_code, classroom_name")
      .in("student_id", studentIds)

    for (const row of dirRows ?? []) {
      if (!row.student_id) continue
      const name =
        row.full_name ||
        (row.first_name ? `${row.first_name} ${row.last_name ?? ""}`.trim() : null) ||
        row.student_code ||
        "ไม่ระบุชื่อนักเรียน"
      studentMap.set(row.student_id, {
        fullName: name,
        studentCode: row.student_code,
        classroomName: row.classroom_name,
      })
    }
  }

  return filtered.map((item) => {
    const studentInfo = item.studentId ? studentMap.get(item.studentId) : null
    return {
      ...item,
      studentName: studentInfo?.fullName ?? "ไม่ระบุชื่อนักเรียน",
      studentCode: studentInfo?.studentCode ?? null,
      classroomName: studentInfo?.classroomName ?? null,
      dueStatus: calculateDueStatus(item.dueDate),
    }
  })
}

/**
 * Computes consolidated overdue and due-in-7-days counts across all follow-up sources (E3).
 */
export async function getUnifiedFollowUpMetrics(): Promise<UnifiedFollowUpMetrics> {
  const queue = await getUnifiedFollowUpQueue()
  let overdueCount = 0
  let dueSoonCount = 0

  for (const item of queue) {
    if (item.dueStatus === "overdue") {
      overdueCount++
    } else if (item.dueStatus === "due_today" || item.dueStatus === "due_soon") {
      dueSoonCount++
    }
  }

  return {
    overdueCount,
    dueSoonCount,
    totalDueCount: overdueCount + dueSoonCount,
  }
}
