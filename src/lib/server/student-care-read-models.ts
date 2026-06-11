import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import {
  getCurrentSemesterId,
  getCurrentUserContext,
  type CurrentUserContext,
} from "./current-user"

type PublicSchema = Database["public"]
type PublicTables = PublicSchema["Tables"]
type PublicViews = PublicSchema["Views"]
type RiskLevel = PublicSchema["Enums"]["risk_level"]
type SeverityLevel = PublicSchema["Enums"]["severity_level"]
type GradeLevel = PublicSchema["Enums"]["grade_level"]
type GenderType = PublicSchema["Enums"]["gender_type"]
type StudentStatus = PublicSchema["Enums"]["student_status"]
type UserRole = PublicSchema["Enums"]["user_role"]

export type ActionItemStatus = "todo" | "in_progress" | "done" | "cancelled"
export type StudentNoteVisibility = "team" | "private" | "leadership"

type ActionItemRow = PublicTables["action_items"]["Row"]
type StudentAttachmentRow = PublicTables["student_attachments"]["Row"]
type StudentTimelineEventRow = PublicTables["student_timeline_events"]["Row"]
type StudentNoteRow = PublicTables["student_notes"]["Row"]
type ProfileSummaryRow = Pick<
  PublicTables["profiles"]["Row"],
  "id" | "first_name" | "last_name" | "role"
>
type StudentDirectoryViewRow = PublicViews["v_current_student_directory"]["Row"]
type StudentWorklistViewRow = PublicViews["v_student_worklist"]["Row"]

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

export type StudentNoteItem = {
  id: string
  studentId: string
  authorId: string
  authorName: string
  authorRole: UserRole | null
  category: string
  body: string
  visibility: StudentNoteVisibility
  pinned: boolean
  sourceTable: string | null
  sourceId: string | null
  createdAt: string
  updatedAt: string
}

export type StudentAttachmentItem = {
  id: string
  studentId: string
  uploadedBy: string | null
  bucket: string
  storagePath: string
  fileName: string
  mimeType: string | null
  fileSize: number | null
  referenceTable: string | null
  referenceId: string | null
  isPrivate: boolean
  downloadUrl: string | null
  createdAt: string
  updatedAt: string
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

export type StudentCareProfile = {
  studentId: string
  studentCode: string
  fullName: string
  firstName: string | null
  lastName: string | null
  prefix: string | null
  nickname: string | null
  gender: GenderType | null
  photoUrl: string | null
  status: StudentStatus | null
  classroomName: string | null
  gradeLevel: GradeLevel | null
  section: number | null
  studentNumber: number | null
  primaryGuardianName: string | null
  primaryGuardianPhone: string | null
  travelMethod: string | null
  distanceToSchoolKm: number | null
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

type StudentWorklistOptions = {
  limit?: number
}

type ActionQueueOptions = {
  limit?: number
  statuses?: ActionItemStatus[]
  assignedToMe?: boolean
}

const actionStatuses: ActionItemStatus[] = ["todo", "in_progress", "done", "cancelled"]
const noteVisibilities: StudentNoteVisibility[] = ["team", "private", "leadership"]
const attachmentWriterRoles: UserRole[] = [
  "admin",
  "homeroom_teacher",
  "subject_teacher",
  "counselor",
]
const maxStudentAttachmentSizeBytes = 10 * 1024 * 1024
const studentAttachmentBucket = "documents"
const studentAttachmentSignedUrlSeconds = 10 * 60

function toActionItemStatus(status: string | null): ActionItemStatus {
  return actionStatuses.includes(status as ActionItemStatus)
    ? (status as ActionItemStatus)
    : "todo"
}

function toStudentNoteVisibility(visibility: string | null): StudentNoteVisibility {
  return noteVisibilities.includes(visibility as StudentNoteVisibility)
    ? (visibility as StudentNoteVisibility)
    : "team"
}

function mapWorklistRow(row: StudentWorklistViewRow): StudentWorklistItem | null {
  if (!row.student_id) {
    return null
  }

  return {
    studentId: row.student_id,
    studentCode: row.student_code ?? "-",
    fullName: row.full_name ?? row.student_code ?? "ไม่ระบุชื่อนักเรียน",
    photoUrl: row.photo_url,
    classroomName: row.classroom_name,
    gradeLevel: row.grade_level,
    section: row.section,
    studentNumber: row.student_number,
    primaryGuardianName: row.primary_guardian_name,
    primaryGuardianPhone: row.primary_guardian_phone,
    riskLevel: row.risk_level ?? "normal",
    riskScore: row.risk_score ?? 0,
    riskTrend: row.risk_trend,
    openSupportCount: row.open_support_count ?? 0,
    activePlanCount: row.active_plan_count ?? 0,
    openActionCount: row.open_action_count ?? 0,
    activeFlagCount: row.active_flag_count ?? 0,
    nextDueDate: row.next_due_date,
    absentDays30d: row.absent_days_30d ?? 0,
    lateDays30d: row.late_days_30d ?? 0,
    recordedDays30d: row.recorded_days_30d ?? 0,
    attendanceRate30d: row.attendance_rate_30d,
    priorityScore: row.priority_score ?? 0,
  }
}

function mapProfileRows(
  studentId: string,
  directory: StudentDirectoryViewRow | null,
  worklist: StudentWorklistItem | null,
): StudentCareProfile | null {
  if (!directory && !worklist) {
    return null
  }

  const fullName =
    directory?.full_name ??
    worklist?.fullName ??
    directory?.student_code ??
    worklist?.studentCode ??
    "ไม่ระบุชื่อนักเรียน"

  return {
    studentId,
    studentCode: directory?.student_code ?? worklist?.studentCode ?? "-",
    fullName,
    firstName: directory?.first_name ?? null,
    lastName: directory?.last_name ?? null,
    prefix: directory?.prefix ?? null,
    nickname: directory?.nickname ?? null,
    gender: directory?.gender ?? null,
    photoUrl: directory?.photo_url ?? worklist?.photoUrl ?? null,
    status: directory?.status ?? null,
    classroomName: directory?.classroom_name ?? worklist?.classroomName ?? null,
    gradeLevel: directory?.grade_level ?? worklist?.gradeLevel ?? null,
    section: directory?.section ?? worklist?.section ?? null,
    studentNumber: directory?.student_number ?? worklist?.studentNumber ?? null,
    primaryGuardianName:
      directory?.primary_guardian_name ?? worklist?.primaryGuardianName ?? null,
    primaryGuardianPhone:
      directory?.primary_guardian_phone ?? worklist?.primaryGuardianPhone ?? null,
    travelMethod: directory?.travel_method ?? null,
    distanceToSchoolKm: directory?.distance_to_school_km ?? null,
    riskLevel: worklist?.riskLevel ?? "normal",
    riskScore: worklist?.riskScore ?? 0,
    riskTrend: worklist?.riskTrend ?? null,
    openSupportCount: worklist?.openSupportCount ?? 0,
    activePlanCount: worklist?.activePlanCount ?? 0,
    openActionCount: worklist?.openActionCount ?? 0,
    activeFlagCount: worklist?.activeFlagCount ?? 0,
    nextDueDate: worklist?.nextDueDate ?? null,
    absentDays30d: worklist?.absentDays30d ?? 0,
    lateDays30d: worklist?.lateDays30d ?? 0,
    recordedDays30d: worklist?.recordedDays30d ?? 0,
    attendanceRate30d: worklist?.attendanceRate30d ?? null,
    priorityScore: worklist?.priorityScore ?? 0,
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
    status: toActionItemStatus(row.status),
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

function mapNoteRow(
  row: StudentNoteRow,
  authorsById: Map<string, ProfileSummaryRow>,
): StudentNoteItem {
  const author = authorsById.get(row.author_id)

  return {
    id: row.id,
    studentId: row.student_id,
    authorId: row.author_id,
    authorName: author
      ? `${author.first_name} ${author.last_name}`.trim()
      : "ไม่ระบุผู้บันทึก",
    authorRole: author?.role ?? null,
    category: row.category,
    body: row.body,
    visibility: toStudentNoteVisibility(row.visibility),
    pinned: row.pinned,
    sourceTable: row.source_table,
    sourceId: row.source_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapAttachmentRow(
  row: StudentAttachmentRow,
  downloadUrl: string | null,
): StudentAttachmentItem {
  return {
    id: row.id,
    studentId: row.student_id,
    uploadedBy: row.uploaded_by,
    bucket: row.bucket,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    referenceTable: row.reference_table,
    referenceId: row.reference_id,
    isPrivate: row.is_private,
    downloadUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function assertStaffContext(
  context: CurrentUserContext,
): asserts context is CurrentUserContext & { profileId: string; studentId: null } {
  if (!context.profileId || context.role === "student") {
    throw new Error("FORBIDDEN")
  }
}

function assertAttachmentWriterContext(
  context: CurrentUserContext,
): asserts context is CurrentUserContext & { profileId: string; studentId: null; role: UserRole } {
  assertStaffContext(context)

  if (!attachmentWriterRoles.includes(context.role as UserRole)) {
    throw new Error("FORBIDDEN")
  }
}

function assertStudentAccess(context: CurrentUserContext, studentId: string) {
  if (context.role === "student" && context.studentId !== studentId) {
    throw new Error("FORBIDDEN")
  }
}

function sanitizeAttachmentFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()

  const fallback = normalized || "attachment"

  if (fallback.length <= 140) {
    return fallback
  }

  const extensionIndex = fallback.lastIndexOf(".")

  if (extensionIndex > 0 && extensionIndex >= fallback.length - 12) {
    const extension = fallback.slice(extensionIndex)
    return `${fallback.slice(0, 140 - extension.length)}${extension}`
  }

  return fallback.slice(0, 140)
}

function normalizeReferenceTable(value?: string | null) {
  const normalized = value?.trim()

  if (!normalized) {
    return null
  }

  return normalized.replace(/[^a-zA-Z0-9_:-]/g, "_").slice(0, 80)
}

function normalizeReferenceId(value?: string | null) {
  const normalized = value?.trim()

  if (!normalized) {
    return null
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    normalized,
  )
    ? normalized
    : null
}

export async function getStudentWorklist(
  options: StudentWorklistOptions = {},
): Promise<StudentWorklistItem[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

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

  return (data ?? [])
    .map(mapWorklistRow)
    .filter((student): student is StudentWorklistItem => student !== null)
}

export async function getStudentCareProfile(
  studentId: string,
): Promise<StudentCareProfile | null> {
  const context = await getCurrentUserContext()
  assertStudentAccess(context, studentId)

  const client = await createClient()
  const [directoryResult, worklistResult] = await Promise.all([
    client
      .from("v_current_student_directory")
      .select("*")
      .eq("school_id", context.schoolId)
      .eq("student_id", studentId)
      .maybeSingle(),
    client
      .from("v_student_worklist")
      .select("*")
      .eq("school_id", context.schoolId)
      .eq("student_id", studentId)
      .maybeSingle(),
  ])

  if (directoryResult.error) {
    throw new Error(directoryResult.error.message)
  }

  if (worklistResult.error) {
    throw new Error(worklistResult.error.message)
  }

  const worklist = worklistResult.data ? mapWorklistRow(worklistResult.data) : null

  return mapProfileRows(studentId, directoryResult.data ?? null, worklist)
}

export async function getStudentActionItems(
  studentId: string,
  options: ActionQueueOptions = {},
): Promise<ActionQueueItem[]> {
  const context = await getCurrentUserContext()
  assertStudentAccess(context, studentId)

  const client = await createClient()
  const statuses = options.statuses ?? ["todo", "in_progress"]

  const { data: worklistRow, error: worklistError } = await client
    .from("v_student_worklist")
    .select("*")
    .eq("school_id", context.schoolId)
    .eq("student_id", studentId)
    .maybeSingle()

  if (worklistError) {
    throw new Error(worklistError.message)
  }

  const worklist = worklistRow ? mapWorklistRow(worklistRow) : null
  const studentsById = new Map<string, StudentWorklistItem>(
    worklist ? [[worklist.studentId, worklist]] : [],
  )

  let query = client
    .from("action_items")
    .select("*")
    .eq("school_id", context.schoolId)
    .eq("student_id", studentId)
    .in("status", statuses)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })

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

export async function getActionQueue(
  options: ActionQueueOptions = {},
): Promise<ActionQueueItem[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()
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
  assertStudentAccess(context, studentId)

  const client = await createClient()
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

export async function getStudentNotes(
  studentId: string,
  limit = 20,
): Promise<StudentNoteItem[]> {
  const context = await getCurrentUserContext()
  assertStudentAccess(context, studentId)

  const client = await createClient()
  const { data, error } = await client
    .from("student_notes")
    .select("*")
    .eq("school_id", context.schoolId)
    .eq("student_id", studentId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  const rows = data ?? []
  const authorIds = Array.from(new Set(rows.map((row) => row.author_id)))
  const authorsById = new Map<string, ProfileSummaryRow>()

  if (authorIds.length > 0) {
    const { data: authors, error: authorsError } = await client
      .from("profiles")
      .select("id, first_name, last_name, role")
      .in("id", authorIds)

    if (authorsError) {
      throw new Error(authorsError.message)
    }

    for (const author of authors ?? []) {
      authorsById.set(author.id, author)
    }
  }

  return rows.map((row) => mapNoteRow(row, authorsById))
}

export async function getStudentAttachments(
  studentId: string,
  limit = 12,
): Promise<StudentAttachmentItem[]> {
  const context = await getCurrentUserContext()
  assertStudentAccess(context, studentId)

  const client = await createClient()
  const { data, error } = await client
    .from("student_attachments")
    .select("*")
    .eq("school_id", context.schoolId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return Promise.all(
    (data ?? []).map(async (row) => {
      const { data: signedData } = await client.storage
        .from(row.bucket)
        .createSignedUrl(row.storage_path, studentAttachmentSignedUrlSeconds)

      return mapAttachmentRow(row, signedData?.signedUrl ?? null)
    }),
  )
}

export async function uploadStudentAttachment(input: {
  studentId: string
  file: File
  referenceTable?: string | null
  referenceId?: string | null
  isPrivate?: boolean
}): Promise<StudentAttachmentItem> {
  const context = await getCurrentUserContext()
  assertAttachmentWriterContext(context)

  if (!input.studentId) {
    throw new Error("VALIDATION_ERROR")
  }

  if (!input.file || input.file.size <= 0) {
    throw new Error("ATTACHMENT_FILE_REQUIRED")
  }

  if (input.file.size > maxStudentAttachmentSizeBytes) {
    throw new Error("ATTACHMENT_FILE_TOO_LARGE")
  }

  const client = await createClient()
  const { data: student, error: studentError } = await client
    .from("students")
    .select("id")
    .eq("school_id", context.schoolId)
    .eq("id", input.studentId)
    .maybeSingle()

  if (studentError) {
    throw new Error(studentError.message)
  }

  if (!student) {
    throw new Error("NOT_FOUND")
  }

  const fileName = sanitizeAttachmentFileName(input.file.name)
  const mimeType = input.file.type || "application/octet-stream"
  const storagePath = `student-attachments/${input.studentId}/${globalThis.crypto.randomUUID()}-${fileName}`
  const fileBuffer = await input.file.arrayBuffer()
  const { error: uploadError } = await client.storage
    .from(studentAttachmentBucket)
    .upload(storagePath, fileBuffer, {
      cacheControl: "3600",
      contentType: mimeType,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data, error } = await client
    .from("student_attachments")
    .insert({
      school_id: context.schoolId,
      student_id: input.studentId,
      uploaded_by: context.profileId,
      bucket: studentAttachmentBucket,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: mimeType,
      file_size: input.file.size,
      reference_table: normalizeReferenceTable(input.referenceTable),
      reference_id: normalizeReferenceId(input.referenceId),
      is_private: input.isPrivate ?? true,
      metadata: {
        original_name: input.file.name,
        uploaded_via: "student_care_panel",
      },
    })
    .select("*")
    .single()

  if (error) {
    await client.storage.from(studentAttachmentBucket).remove([storagePath])
    throw new Error(error.message)
  }

  const { data: signedData } = await client.storage
    .from(data.bucket)
    .createSignedUrl(data.storage_path, studentAttachmentSignedUrlSeconds)

  return mapAttachmentRow(data, signedData?.signedUrl ?? null)
}

export async function createStudentNote(input: {
  studentId: string
  body: string
  category?: string
  visibility?: StudentNoteVisibility
  pinned?: boolean
}): Promise<StudentNoteItem> {
  const context = await getCurrentUserContext()
  assertStaffContext(context)

  const body = input.body.trim()

  if (!body) {
    throw new Error("VALIDATION_ERROR")
  }

  const client = await createClient()
  const { data, error } = await client
    .from("student_notes")
    .insert({
      school_id: context.schoolId,
      student_id: input.studentId,
      author_id: context.profileId,
      category: input.category || "general",
      body,
      visibility: input.visibility ?? "team",
      pinned: input.pinned ?? false,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const { data: author, error: authorError } = await client
    .from("profiles")
    .select("id, first_name, last_name, role")
    .eq("id", context.profileId)
    .single()

  if (authorError) {
    throw new Error(authorError.message)
  }

  return mapNoteRow(data, new Map([[author.id, author]]))
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

  const client = await createClient()
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
