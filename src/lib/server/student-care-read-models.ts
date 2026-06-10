import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database, Json } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import {
  getCurrentSemesterId,
  getCurrentUserContext,
  type CurrentUserContext,
} from "./current-user"

type PublicSchema = Database["public"]
type RiskLevel = PublicSchema["Enums"]["risk_level"]
type SeverityLevel = PublicSchema["Enums"]["severity_level"]
type GradeLevel = PublicSchema["Enums"]["grade_level"]
type GenderType = PublicSchema["Enums"]["gender_type"]
type StudentStatus = PublicSchema["Enums"]["student_status"]

export type ActionItemStatus = "todo" | "in_progress" | "done" | "cancelled"

type CareTable<TRow, TInsert = Partial<TRow>, TUpdate = Partial<TRow>> = {
  Row: TRow
  Insert: TInsert
  Update: TUpdate
  Relationships: []
}

type CareView<TRow> = {
  Row: TRow
  Relationships: []
}

type ActionItemRow = {
  id: string
  school_id: string
  student_id: string | null
  title: string
  description: string | null
  category: string
  priority: SeverityLevel
  status: ActionItemStatus
  assigned_to: string | null
  created_by: string | null
  due_date: string | null
  completed_at: string | null
  completed_by: string | null
  source_table: string
  source_id: string
  metadata: Json
  created_at: string
  updated_at: string
}

type StudentTimelineEventRow = {
  id: string
  school_id: string
  student_id: string
  event_at: string
  event_type: string
  title: string
  description: string | null
  severity: SeverityLevel | null
  source_table: string
  source_id: string
  actor_id: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

type StudentWorklistViewRow = {
  school_id: string
  student_id: string
  student_code: string
  full_name: string
  photo_url: string | null
  classroom_id: string | null
  classroom_name: string | null
  grade_level: GradeLevel | null
  section: number | null
  student_number: number | null
  primary_guardian_name: string | null
  primary_guardian_phone: string | null
  risk_level: RiskLevel
  risk_score: number
  risk_trend: string | null
  open_support_count: number
  active_plan_count: number
  open_action_count: number
  active_flag_count: number
  next_due_date: string | null
  absent_days_30d: number
  late_days_30d: number
  recorded_days_30d: number
  attendance_rate_30d: number | null
  priority_score: number
}

type StudentDirectoryViewRow = {
  school_id: string
  student_id: string
  student_code: string
  user_id: string | null
  prefix: string | null
  first_name: string
  last_name: string
  full_name: string
  nickname: string | null
  gender: GenderType
  photo_url: string | null
  status: StudentStatus
  distance_to_school_km: number | null
  travel_method: string | null
  classroom_id: string | null
  classroom_name: string | null
  grade_level: GradeLevel | null
  section: number | null
  student_number: number | null
  semester_id: string | null
  primary_guardian_id: string | null
  primary_guardian_name: string | null
  primary_guardian_phone: string | null
}

type CareDatabase = Omit<Database, "public"> & {
  public: Omit<PublicSchema, "Tables" | "Views"> & {
    Tables: PublicSchema["Tables"] & {
      action_items: CareTable<ActionItemRow>
      student_timeline_events: CareTable<StudentTimelineEventRow>
    }
    Views: PublicSchema["Views"] & {
      v_current_student_directory: CareView<StudentDirectoryViewRow>
      v_student_worklist: CareView<StudentWorklistViewRow>
    }
  }
}

export type StudentWorklistItem = {
  studentId: string
  studentCode: string
  fullName: string
  photoUrl: string | null
  classroomName: string | null
  gradeLevel: GradeLevel | null
  section: number | null
  studentNumber: number | null
  primaryGuardianName: string | null
  primaryGuardianPhone: string | null
  riskLevel: RiskLevel
  riskScore: number
  riskTrend: string | null
  openSupportCount: number
  activePlanCount: number
  openActionCount: number
  activeFlagCount: number
  nextDueDate: string | null
  absentDays30d: number
  lateDays30d: number
  recordedDays30d: number
  attendanceRate30d: number | null
  priorityScore: number
}

export type ActionQueueItem = {
  id: string
  studentId: string | null
  studentName: string | null
  title: string
  description: string | null
  category: string
  priority: SeverityLevel
  status: ActionItemStatus
  dueDate: string | null
  assignedTo: string | null
  sourceTable: string
  sourceId: string
}

export type StudentTimelineItem = {
  id: string
  studentId: string
  eventAt: string
  eventType: string
  title: string
  description: string | null
  severity: SeverityLevel | null
  sourceTable: string
  sourceId: string
  actorId: string | null
}

export type StudentCareDashboard = {
  currentSemesterId: string | null
  metrics: {
    totalStudents: number
    highRiskStudents: number
    watchStudents: number
    openSupportCases: number
    activePlans: number
    openActionItems: number
    averageAttendance30d: number | null
  }
  priorityStudents: StudentWorklistItem[]
  actionQueue: ActionQueueItem[]
}

type StudentWorklistOptions = {
  limit?: number
}

type ActionQueueOptions = {
  limit?: number
  statuses?: ActionItemStatus[]
  assignedToMe?: boolean
}

function getCareClient(client: Awaited<ReturnType<typeof createClient>>) {
  return client as unknown as SupabaseClient<CareDatabase>
}

function mapWorklistRow(row: StudentWorklistViewRow): StudentWorklistItem {
  return {
    studentId: row.student_id,
    studentCode: row.student_code,
    fullName: row.full_name,
    photoUrl: row.photo_url,
    classroomName: row.classroom_name,
    gradeLevel: row.grade_level,
    section: row.section,
    studentNumber: row.student_number,
    primaryGuardianName: row.primary_guardian_name,
    primaryGuardianPhone: row.primary_guardian_phone,
    riskLevel: row.risk_level,
    riskScore: row.risk_score,
    riskTrend: row.risk_trend,
    openSupportCount: row.open_support_count,
    activePlanCount: row.active_plan_count,
    openActionCount: row.open_action_count,
    activeFlagCount: row.active_flag_count,
    nextDueDate: row.next_due_date,
    absentDays30d: row.absent_days_30d,
    lateDays30d: row.late_days_30d,
    recordedDays30d: row.recorded_days_30d,
    attendanceRate30d: row.attendance_rate_30d,
    priorityScore: row.priority_score,
  }
}

function mapActionRow(
  row: ActionItemRow,
  studentsById: Map<string, StudentWorklistItem>,
): ActionQueueItem {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_id ? studentsById.get(row.student_id)?.fullName ?? null : null,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date,
    assignedTo: row.assigned_to,
    sourceTable: row.source_table,
    sourceId: row.source_id,
  }
}

function mapTimelineRow(row: StudentTimelineEventRow): StudentTimelineItem {
  return {
    id: row.id,
    studentId: row.student_id,
    eventAt: row.event_at,
    eventType: row.event_type,
    title: row.title,
    description: row.description,
    severity: row.severity,
    sourceTable: row.source_table,
    sourceId: row.source_id,
    actorId: row.actor_id,
  }
}

function assertStaffContext(
  context: CurrentUserContext,
): asserts context is CurrentUserContext & { profileId: string; studentId: null } {
  if (!context.profileId || context.role === "student") {
    throw new Error("FORBIDDEN")
  }
}

export async function getStudentWorklist(
  options: StudentWorklistOptions = {},
): Promise<StudentWorklistItem[]> {
  const context = await getCurrentUserContext()
  const client = getCareClient(await createClient())

  let query = client
    .from("v_student_worklist")
    .select("*")
    .eq("school_id", context.schoolId)
    .order("priority_score", { ascending: false })
    .order("full_name", { ascending: true })

  if (context.role === "student" && context.studentId) {
    query = query.eq("student_id", context.studentId)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(mapWorklistRow)
}

export async function getActionQueue(
  options: ActionQueueOptions = {},
): Promise<ActionQueueItem[]> {
  const context = await getCurrentUserContext()
  const client = getCareClient(await createClient())
  const statuses = options.statuses ?? ["todo", "in_progress"]
  const studentRows = await getStudentWorklist({ limit: 500 })
  const studentsById = new Map(studentRows.map((student) => [student.studentId, student]))

  let query = client
    .from("action_items")
    .select("*")
    .eq("school_id", context.schoolId)
    .in("status", statuses)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (context.role === "student" && context.studentId) {
    query = query.eq("student_id", context.studentId)
  }

  if (options.assignedToMe) {
    assertStaffContext(context)
    query = query.eq("assigned_to", context.profileId)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapActionRow(row, studentsById))
}

export async function getStudentTimeline(
  studentId: string,
  limit = 30,
): Promise<StudentTimelineItem[]> {
  const context = await getCurrentUserContext()

  if (context.role === "student" && context.studentId !== studentId) {
    throw new Error("FORBIDDEN")
  }

  const client = getCareClient(await createClient())
  const { data, error } = await client
    .from("student_timeline_events")
    .select("*")
    .eq("school_id", context.schoolId)
    .eq("student_id", studentId)
    .order("event_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(mapTimelineRow)
}

export async function getStudentCareDashboard(): Promise<StudentCareDashboard> {
  const context = await getCurrentUserContext()
  const [currentSemesterId, worklist, actionQueue] = await Promise.all([
    getCurrentSemesterId(context.schoolId),
    getStudentWorklist({ limit: 500 }),
    getActionQueue({ limit: 12 }),
  ])

  const attendanceRates = worklist
    .map((student) => student.attendanceRate30d)
    .filter((rate): rate is number => rate !== null)

  const averageAttendance30d =
    attendanceRates.length > 0
      ? Math.round(
          (attendanceRates.reduce((total, rate) => total + rate, 0) / attendanceRates.length) *
            10,
        ) / 10
      : null

  return {
    currentSemesterId,
    metrics: {
      totalStudents: worklist.length,
      highRiskStudents: worklist.filter((student) => student.riskLevel === "high").length,
      watchStudents: worklist.filter((student) => student.riskLevel === "watch").length,
      openSupportCases: worklist.reduce(
        (total, student) => total + student.openSupportCount,
        0,
      ),
      activePlans: worklist.reduce((total, student) => total + student.activePlanCount, 0),
      openActionItems: worklist.reduce((total, student) => total + student.openActionCount, 0),
      averageAttendance30d,
    },
    priorityStudents: worklist.slice(0, 8),
    actionQueue,
  }
}

export async function updateActionItemStatus(
  actionItemId: string,
  status: ActionItemStatus,
): Promise<ActionQueueItem> {
  const context = await getCurrentUserContext()
  assertStaffContext(context)

  const client = getCareClient(await createClient())
  const completedAt = status === "done" ? new Date().toISOString() : null
  const completedBy = status === "done" ? context.profileId : null

  const { data, error } = await client
    .from("action_items")
    .update({
      status,
      completed_at: completedAt,
      completed_by: completedBy,
    })
    .eq("id", actionItemId)
    .eq("school_id", context.schoolId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const students = await getStudentWorklist({ limit: 500 })
  const studentsById = new Map(students.map((student) => [student.studentId, student]))

  return mapActionRow(data, studentsById)
}
