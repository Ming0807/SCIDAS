import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext } from "./current-user"

type AttendanceStatus = Database["public"]["Enums"]["attendance_status"]

export type { AttendanceStatus }

export type AttendanceRecordItem = {
  id: string
  studentId: string
  studentName: string
  studentCode: string | null
  classroomName: string | null
  gradeLevel: string | null
  status: AttendanceStatus
  statusLabel: string
  checkInTime: string | null
  remark: string | null
  date: string
  recordedByName: string | null
}

export type AttendanceSummary = {
  total: number
  present: number
  absent: number
  late: number
  leave: number
  sick: number
  presentRate: number | null
}

export type AttendanceDashboard = {
  summary: AttendanceSummary
  records: AttendanceRecordItem[]
  date: string
}

const statusLabels: Record<AttendanceStatus, string> = {
  present: "มาเรียน",
  absent: "ขาด",
  late: "มาสาย",
  leave: "ลา",
  sick: "ป่วย",
}

export function getAttendanceStatusLabel(status: AttendanceStatus): string {
  return statusLabels[status] ?? status
}

export function getAttendanceStatusTone(
  status: AttendanceStatus,
): "success" | "danger" | "info" | "warning" {
  switch (status) {
    case "present":
      return "success"
    case "absent":
      return "danger"
    case "late":
      return "info"
    case "leave":
      return "warning"
    case "sick":
      return "warning"
    default:
      return "info"
  }
}

const todayStr = () => new Date().toISOString().split("T")[0]

export async function getAttendanceDashboard(
  date?: string,
  classroomId?: string,
): Promise<AttendanceDashboard> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const targetDate = date || todayStr()
  const client = await createClient()

  let query = client
    .from("attendance_records")
    .select(
      `
      id,
      student_id,
      status,
      check_in_time,
      remark,
      date,
      students!attendance_records_student_id_fkey (
        first_name,
        last_name,
        student_code
      ),
      classrooms!attendance_records_classroom_id_fkey (
        name,
        grade_level
      ),
      profiles!attendance_records_recorded_by_fkey (
        first_name,
        last_name
      )
    `,
    )
    .eq("school_id", context.schoolId)
    .eq("date", targetDate)
    .order("created_at", { ascending: false })
    .limit(200)

  if (classroomId) {
    query = query.eq("classroom_id", classroomId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as Record<string, any>[]

  const records: AttendanceRecordItem[] = rows.map((row) => {
    const students = row.students as Record<string, unknown> | null | undefined
    const profiles = row.profiles as Record<string, unknown> | null | undefined
    const classrooms = row.classrooms as Record<string, unknown> | null | undefined

    const studentName = students
      ? `${(students.first_name as string) ?? ""} ${(students.last_name as string) ?? ""}`.trim()
      : "ไม่ทราบชื่อ"

    const recordedByName = profiles
      ? `${(profiles.first_name as string) ?? ""} ${(profiles.last_name as string) ?? ""}`.trim()
      : null

    return {
      id: row.id as string,
      studentId: row.student_id as string,
      studentName: studentName || "ไม่ทราบชื่อ",
      studentCode: (students?.student_code as string) ?? null,
      classroomName: (classrooms?.name as string) ?? null,
      gradeLevel: (classrooms?.grade_level as string) ?? null,
      status: row.status as AttendanceStatus,
      statusLabel: getAttendanceStatusLabel(row.status as AttendanceStatus),
      checkInTime: (row.check_in_time as string) ?? null,
      remark: (row.remark as string) ?? null,
      date: row.date as string,
      recordedByName,
    }
  })

  // Compute summary
  let present = 0
  let absent = 0
  let late = 0
  let leave = 0
  let sick = 0

  for (const r of records) {
    switch (r.status) {
      case "present":
        present++
        break
      case "absent":
        absent++
        break
      case "late":
        late++
        break
      case "leave":
        leave++
        break
      case "sick":
        sick++
        break
    }
  }

  const total = records.length
  const presentRate = total > 0 ? Math.round((present / total) * 1000) / 10 : null

  return {
    summary: { total, present, absent, late, leave, sick, presentRate },
    records,
    date: targetDate,
  }
}
