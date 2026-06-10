import type { StatusTone } from "@/lib/design/status"
import {
  formatClassroomSection,
  formatGradeLevel,
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"

export type StudentListItem = {
  id: string
  name: string
  studentCode: string
  grade: string
  gradeLevel: string | null
  classroom: string
  classroomName: string | null
  section: number | null
  studentNumber: number | null
  status: StatusTone
  statusLabel: string
  riskLevel: StudentWorklistItem["riskLevel"]
  riskScore: number
  guardian: string
  phone: string
  avatarUrl: string
  attendanceRate30d: number | null
  absentDays30d: number
  lateDays30d: number
  openActionCount: number
  openSupportCount: number
  activePlanCount: number
  activeFlagCount: number
  nextDueDate: string | null
  priorityScore: number
}

export type StudentSummary = {
  total: number
  normal: number
  watch: number
  highRisk: number
  specialCare: number
  openActions: number
  averageAttendance30d: number | null
}

export type ClassSummaryItem = {
  id: string
  label: string
  gradeLevel: string | null
  count: number
  watch: number
  highRisk: number
}

export type StudentFilterState = {
  q: string
  grade: string
  classroom: string
  status: string
}

export type StudentFilterOptions = {
  grades: Array<{ value: string; label: string; count: number }>
  classrooms: Array<{ value: string; label: string; count: number }>
  statuses: Array<{ value: string; label: string; count: number }>
}

export function toStudentListItem(student: StudentWorklistItem): StudentListItem {
  return {
    id: student.studentId,
    name: student.fullName,
    studentCode: student.studentCode,
    grade: formatGradeLevel(student.gradeLevel),
    gradeLevel: student.gradeLevel,
    classroom: formatClassroomSection(student.section),
    classroomName: student.classroomName,
    section: student.section,
    studentNumber: student.studentNumber,
    status: getStudentRiskTone(student.riskLevel),
    statusLabel: getStudentRiskLabel(student.riskLevel),
    riskLevel: student.riskLevel,
    riskScore: student.riskScore,
    guardian: student.primaryGuardianName ?? "-",
    phone: student.primaryGuardianPhone ?? "-",
    avatarUrl: student.photoUrl ?? "",
    attendanceRate30d: student.attendanceRate30d,
    absentDays30d: student.absentDays30d,
    lateDays30d: student.lateDays30d,
    openActionCount: student.openActionCount,
    openSupportCount: student.openSupportCount,
    activePlanCount: student.activePlanCount,
    activeFlagCount: student.activeFlagCount,
    nextDueDate: student.nextDueDate,
    priorityScore: student.priorityScore,
  }
}

export function createStudentSummary(students: StudentListItem[]): StudentSummary {
  const attendanceRates = students
    .map((student) => student.attendanceRate30d)
    .filter((rate): rate is number => rate !== null)

  return {
    total: students.length,
    normal: students.filter((student) => student.riskLevel === "normal").length,
    watch: students.filter((student) => student.riskLevel === "watch").length,
    highRisk: students.filter((student) => student.riskLevel === "high").length,
    specialCare: students.filter(
      (student) =>
        student.openSupportCount > 0 ||
        student.activePlanCount > 0 ||
        student.activeFlagCount > 0,
    ).length,
    openActions: students.reduce((total, student) => total + student.openActionCount, 0),
    averageAttendance30d:
      attendanceRates.length > 0
        ? Math.round(
            (attendanceRates.reduce((total, rate) => total + rate, 0) /
              attendanceRates.length) *
              10,
          ) / 10
        : null,
  }
}

export function createClassSummary(students: StudentListItem[]): ClassSummaryItem[] {
  const rows = new Map<string, ClassSummaryItem>()

  for (const student of students) {
    const id = student.gradeLevel ?? "unknown"
    const current = rows.get(id) ?? {
      id,
      label: student.grade,
      gradeLevel: student.gradeLevel,
      count: 0,
      watch: 0,
      highRisk: 0,
    }

    current.count += 1

    if (student.riskLevel === "watch") {
      current.watch += 1
    }

    if (student.riskLevel === "high") {
      current.highRisk += 1
    }

    rows.set(id, current)
  }

  return Array.from(rows.values()).sort((a, b) => a.label.localeCompare(b.label, "th"))
}

export function createStudentFilterOptions(
  students: StudentListItem[],
): StudentFilterOptions {
  const grades = new Map<string, { value: string; label: string; count: number }>()
  const classrooms = new Map<string, { value: string; label: string; count: number }>()
  const statuses = new Map<string, { value: string; label: string; count: number }>()

  for (const student of students) {
    if (student.gradeLevel) {
      const current = grades.get(student.gradeLevel) ?? {
        value: student.gradeLevel,
        label: student.grade,
        count: 0,
      }
      current.count += 1
      grades.set(student.gradeLevel, current)
    }

    if (student.section !== null) {
      const value = String(student.section)
      const current = classrooms.get(value) ?? {
        value,
        label: `ห้อง ${value}`,
        count: 0,
      }
      current.count += 1
      classrooms.set(value, current)
    }

    const currentStatus = statuses.get(student.riskLevel) ?? {
      value: student.riskLevel,
      label: student.statusLabel,
      count: 0,
    }
    currentStatus.count += 1
    statuses.set(student.riskLevel, currentStatus)
  }

  return {
    grades: Array.from(grades.values()).sort((a, b) => a.label.localeCompare(b.label, "th")),
    classrooms: Array.from(classrooms.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "th", { numeric: true }),
    ),
    statuses: ["normal", "watch", "high"]
      .map((value) => statuses.get(value))
      .filter((item): item is { value: string; label: string; count: number } => Boolean(item)),
  }
}

export function filterStudentRows(
  students: StudentListItem[],
  filters: StudentFilterState,
) {
  const query = filters.q.trim().toLowerCase()

  return students.filter((student) => {
    const matchesQuery =
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.studentCode.toLowerCase().includes(query) ||
      student.guardian.toLowerCase().includes(query)

    const matchesGrade = !filters.grade || student.gradeLevel === filters.grade
    const matchesClassroom =
      !filters.classroom || String(student.section ?? "") === filters.classroom
    const matchesStatus = !filters.status || student.riskLevel === filters.status

    return matchesQuery && matchesGrade && matchesClassroom && matchesStatus
  })
}

export function pickFeaturedStudent(students: StudentListItem[]) {
  return students[0] ?? null
}
