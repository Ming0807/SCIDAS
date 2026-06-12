import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext } from "./current-user"

export type BehaviorType = Database["public"]["Enums"]["behavior_type"]
type SeverityLevel = Database["public"]["Enums"]["severity_level"]

export type BehaviorRecordItem = {
  id: string
  studentId: string
  studentName: string
  studentClass: string | null
  behaviorType: BehaviorType
  category: string | null
  description: string
  points: number
  severity: SeverityLevel | null
  date: string
  reportedByName: string | null
  actionTaken: string | null
  parentNotified: boolean
}

export type BehaviorSummary = {
  totalRecords: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
  studentsNeedingFollowUp: number
  positivePct: number
  negativePct: number
}

export type BehaviorLeaderboardItem = {
  studentId: string
  studentName: string
  studentClass: string | null
  positivePoints: number
}

export type BehaviorDashboard = {
  summary: BehaviorSummary
  recentRecords: BehaviorRecordItem[]
  leaderboard: BehaviorLeaderboardItem[]
  totalRecords: number
}

const behaviorTypeLabels: Record<BehaviorType, string> = {
  positive: "เชิงบวก",
  negative: "เชิงลบ",
  neutral: "ทั่วไป",
}

export function getBehaviorTypeLabel(type: BehaviorType): string {
  return behaviorTypeLabels[type] ?? type
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBehaviorRecordItem(row: Record<string, any>): BehaviorRecordItem {
  const students = row.students as Record<string, unknown> | null | undefined
  const profiles = row.profiles as Record<string, unknown> | null | undefined

  const studentName = students
    ? `${(students.first_name as string) ?? ""} ${(students.last_name as string) ?? ""}`.trim()
    : "ไม่ทราบชื่อ"

  const reportedByName = profiles
    ? `${(profiles.first_name as string) ?? ""} ${(profiles.last_name as string) ?? ""}`.trim()
    : null

  return {
    id: row.id as string,
    studentId: row.student_id as string,
    studentName: studentName || "ไม่ทราบชื่อ",
    studentClass: null, // populated from v_current_student_directory after mapping
    behaviorType: row.behavior_type as BehaviorType,
    category: (row.category as string) ?? null,
    description: row.description as string,
    points: (row.points as number) ?? 0,
    severity: row.severity as SeverityLevel | null,
    date: row.date as string,
    reportedByName,
    actionTaken: (row.action_taken as string) ?? null,
    parentNotified: (row.parent_notified as boolean) ?? false,
  }
}

export async function getBehaviorDashboard(): Promise<BehaviorDashboard> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()

  // Fetch all behavior records for this school (current semester)
  const { data: records, error } = await client
    .from("behavior_records")
    .select(
      `
      id,
      student_id,
      behavior_type,
      category,
      description,
      points,
      severity,
      date,
      action_taken,
      parent_notified,
      reported_by,
      students!behavior_records_student_id_fkey (
        first_name,
        last_name,
        student_code
      ),
      profiles!behavior_records_reported_by_fkey (
        first_name,
        last_name
      )
    `,
    )
    .eq("school_id", context.schoolId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(error.message)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (records ?? []) as Record<string, any>[]

  // Get classroom names from v_current_student_directory
  const studentIds = [...new Set(rows.map((r) => r.student_id as string))]
  const classroomMap = new Map<string, string>()
  if (studentIds.length > 0) {
    const { data: dirRows } = await client
      .from("v_current_student_directory")
      .select("student_id, classroom_name")
      .in("student_id", studentIds)
      .eq("school_id", context.schoolId)
    for (const d of dirRows ?? []) {
      const dir = d as { student_id: string; classroom_name: string | null }
      if (dir.classroom_name) classroomMap.set(dir.student_id, dir.classroom_name)
    }
  }

  const items = rows.map((r) => {
    const item = toBehaviorRecordItem(r)
    const cn = classroomMap.get(item.studentId)
    if (cn) item.studentClass = cn
    return item
  })

  // Compute summary
  let positiveCount = 0
  let negativeCount = 0
  let neutralCount = 0

  // Track students with repeated negative behavior
  const negativeStudentIds = new Set<string>()
  const repeatedNegativeStudents = new Set<string>()

  for (const item of items) {
    if (item.behaviorType === "positive") positiveCount++
    else if (item.behaviorType === "negative") {
      negativeCount++
      if (negativeStudentIds.has(item.studentId)) {
        repeatedNegativeStudents.add(item.studentId)
      }
      negativeStudentIds.add(item.studentId)
    } else neutralCount++
  }

  const total = items.length
  const positivePct = total > 0 ? Math.round((positiveCount / total) * 100) : 0
  const negativePct = total > 0 ? Math.round((negativeCount / total) * 100) : 0

  const summary: BehaviorSummary = {
    totalRecords: total,
    positiveCount,
    negativeCount,
    neutralCount,
    studentsNeedingFollowUp: repeatedNegativeStudents.size,
    positivePct,
    negativePct,
  }

  // Compute leaderboard (top students by positive points)
  const studentPoints = new Map<
    string,
    { studentId: string; studentName: string; studentClass: string | null; positivePoints: number }
  >()

  for (const item of items) {
    if (item.behaviorType !== "positive") continue
    const existing = studentPoints.get(item.studentId)
    if (existing) {
      existing.positivePoints += item.points
    } else {
      studentPoints.set(item.studentId, {
        studentId: item.studentId,
        studentName: item.studentName,
        studentClass: item.studentClass,
        positivePoints: item.points,
      })
    }
  }

  const leaderboard = Array.from(studentPoints.values())
    .sort((a, b) => b.positivePoints - a.positivePoints)
    .slice(0, 5)

  return {
    summary,
    recentRecords: items.slice(0, 10),
    leaderboard,
    totalRecords: total,
  }
}

export async function getBehaviorRecords(
  studentId?: string,
  limit = 20,
): Promise<BehaviorRecordItem[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  let query = client
    .from("behavior_records")
    .select(
      `
      id,
      student_id,
      behavior_type,
      category,
      description,
      points,
      severity,
      date,
      action_taken,
      parent_notified,
      reported_by,
      students!behavior_records_student_id_fkey (
        first_name,
        last_name,
        student_code
      ),
      profiles!behavior_records_reported_by_fkey (
        first_name,
        last_name
      )
    `,
    )
    .eq("school_id", context.schoolId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (studentId) {
    query = query.eq("student_id", studentId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as Record<string, any>[]

  // Get classroom names from v_current_student_directory
  const studentIds = [...new Set(rows.map((r) => r.student_id as string))]
  const classroomMap = new Map<string, string>()
  if (studentIds.length > 0) {
    const { data: dirRows } = await client
      .from("v_current_student_directory")
      .select("student_id, classroom_name")
      .in("student_id", studentIds)
      .eq("school_id", context.schoolId)
    for (const d of dirRows ?? []) {
      const dir = d as { student_id: string; classroom_name: string | null }
      if (dir.classroom_name) classroomMap.set(dir.student_id, dir.classroom_name)
    }
  }

  return rows.map((r) => {
    const item = toBehaviorRecordItem(r)
    const cn = classroomMap.get(item.studentId)
    if (cn) item.studentClass = cn
    return item
  })
}

export async function getBehaviorRecordById(
  recordId: string,
): Promise<BehaviorRecordItem | null> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const { data, error } = await client
    .from("behavior_records")
    .select(
      `
      id,
      student_id,
      behavior_type,
      category,
      description,
      points,
      severity,
      date,
      action_taken,
      parent_notified,
      reported_by,
      students!behavior_records_student_id_fkey (
        first_name,
        last_name,
        student_code
      ),
      profiles!behavior_records_reported_by_fkey (
        first_name,
        last_name
      )
    `,
    )
    .eq("id", recordId)
    .eq("school_id", context.schoolId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toBehaviorRecordItem(data as Record<string, any>)
}

export async function getBehaviorRecordsByStudentId(
  studentId: string,
  limit = 20,
): Promise<BehaviorRecordItem[]> {
  return getBehaviorRecords(studentId, limit)
}
