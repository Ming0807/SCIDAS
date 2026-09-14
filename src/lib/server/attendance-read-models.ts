import { createClient } from "@/utils/supabase/server"
import {
  type AttendanceRiskLevel,
  type AttendanceStatus,
  getAttendanceRisk,
  getAttendanceStatusLabel,
  getAttendanceStatusTone,
  type MonthlyAttendanceSummary,
  type StudentMonthlyAttendanceItem,
} from "@/lib/attendance-constants"

import { getCurrentUserContext } from "./current-user"

export type {
  AttendanceRiskLevel,
  AttendanceStatus,
  MonthlyAttendanceSummary,
  StudentMonthlyAttendanceItem,
}
export { getAttendanceRisk, getAttendanceStatusLabel, getAttendanceStatusTone }

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

export async function getClassroomMonthlyAttendance(
  classroomId: string,
  monthStr?: string,
): Promise<MonthlyAttendanceSummary> {
  const context = await getCurrentUserContext()
  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()

  // Format monthStr: e.g. "2026-09". If omitted, use current month of today.
  const targetMonth =
    monthStr && /^\d{4}-\d{2}$/.test(monthStr)
      ? monthStr
      : new Date().toISOString().slice(0, 7)

  const [yearStr, monthNumStr] = targetMonth.split("-")
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthNumStr, 10)

  // Start date and end date of that month
  const startDate = `${targetMonth}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${targetMonth}-${String(lastDay).padStart(2, "0")}`

  // Format Thai month label
  const monthDate = new Date(year, month - 1, 1)
  const monthLabel = new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(monthDate)

  // 1. Fetch active students in this classroom
  const { data: classStudents, error: stuError } = await client
    .from("classroom_students")
    .select(`
      student_id,
      students!inner (
        id,
        first_name,
        last_name,
        prefix,
        student_code
      )
    `)
    .eq("classroom_id", classroomId)
    .eq("school_id", context.schoolId)
    .eq("is_active", true)

  if (stuError) {
    throw new Error(stuError.message)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stuRows = (classStudents ?? []) as Record<string, any>[]
  const studentMap = new Map<string, { id: string; name: string; code: string | null }>()

  for (const row of stuRows) {
    const s = Array.isArray(row.students) ? row.students[0] : row.students
    if (s) {
      const name = `${s.prefix ?? ""}${s.first_name ?? ""} ${s.last_name ?? ""}`.trim()
      studentMap.set(s.id, {
        id: s.id,
        name: name || "ไม่ทราบชื่อ",
        code: s.student_code ?? null,
      })
    }
  }

  // 2. Fetch all attendance records in this classroom for the month
  const { data: records, error: recError } = await client
    .from("attendance_records")
    .select("student_id, status, date")
    .eq("classroom_id", classroomId)
    .eq("school_id", context.schoolId)
    .gte("date", startDate)
    .lte("date", endDate)

  if (recError) {
    throw new Error(recError.message)
  }

  // Distinct dates recorded in this classroom = totalSchoolDays
  const distinctDates = new Set((records ?? []).map((r) => r.date))
  const totalSchoolDays = distinctDates.size

  // Group records by student
  const studentAttendanceStats = new Map<
    string,
    { present: number; absent: number; late: number; leave: number; sick: number }
  >()

  for (const studentId of studentMap.keys()) {
    studentAttendanceStats.set(studentId, {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      sick: 0,
    })
  }

  for (const r of records ?? []) {
    let stats = studentAttendanceStats.get(r.student_id)
    if (!stats) {
      stats = { present: 0, absent: 0, late: 0, leave: 0, sick: 0 }
      studentAttendanceStats.set(r.student_id, stats)
    }
    const status = r.status as AttendanceStatus
    if (status === "present") stats.present++
    else if (status === "absent") stats.absent++
    else if (status === "late") stats.late++
    else if (status === "leave") stats.leave++
    else if (status === "sick") stats.sick++
  }

  // Calculate items
  const items: StudentMonthlyAttendanceItem[] = []
  let totalRateSum = 0

  for (const [studentId, info] of studentMap.entries()) {
    const stats = studentAttendanceStats.get(studentId) ?? {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      sick: 0,
    }

    // Attendance rate = (present + late) / totalDays * 100
    // If totalSchoolDays == 0, rate is 100%
    const attendedDays = stats.present + stats.late
    const rate =
      totalSchoolDays > 0
        ? Number(((attendedDays / totalSchoolDays) * 100).toFixed(1))
        : 100

    totalRateSum += rate

    const { riskLevel, riskLabel } = getAttendanceRisk(rate)

    items.push({
      studentId,
      studentName: info.name,
      studentCode: info.code,
      totalDays: totalSchoolDays,
      presentDays: stats.present,
      absentDays: stats.absent,
      lateDays: stats.late,
      leaveDays: stats.leave,
      sickDays: stats.sick,
      attendanceRate: rate,
      riskLevel,
      riskLabel,
    })
  }

  // Sort by attendanceRate ascending so students at risk appear first
  items.sort(
    (a, b) =>
      a.attendanceRate - b.attendanceRate ||
      a.studentName.localeCompare(b.studentName, "th"),
  )

  const criticalRiskCount = items.filter((item) => item.riskLevel === "critical").length
  const watchRiskCount = items.filter((item) => item.riskLevel === "watch").length
  const perfectAttendanceCount = items.filter(
    (item) => totalSchoolDays > 0 && item.presentDays === totalSchoolDays,
  ).length
  const averageAttendanceRate =
    items.length > 0 ? Number((totalRateSum / items.length).toFixed(1)) : 100

  return {
    monthStr: targetMonth,
    monthLabel,
    totalSchoolDays,
    averageAttendanceRate,
    criticalRiskCount,
    watchRiskCount,
    perfectAttendanceCount,
    items,
  }
}
