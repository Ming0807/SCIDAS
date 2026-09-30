import type { StatusTone } from "@/lib/design/status"
import {
  compareGradeLevels,
  formatClassroomLabel,
  formatClassroomSection,
  formatFullGradeLevel,
  formatGradeLevel,
  getStudentRiskLabel,
  getStudentRiskTone,
  GRADE_SORT_ORDER,
} from "@/lib/student-care-formatters"
import { inferGradeAndSection } from "@/lib/student-import-parser"
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
  classrooms: Array<{ value: string; label: string; count: number; gradeLevel?: string }>
  statuses: Array<{ value: string; label: string; count: number }>
}

export function toStudentListItem(student: StudentWorklistItem): StudentListItem {
  let gradeLevel = student.gradeLevel
  let section = student.section

  // If gradeLevel is missing, try inferring from classroomName
  if (!gradeLevel && student.classroomName) {
    const inferred = inferGradeAndSection(student.classroomName)
    if (inferred) {
      gradeLevel = inferred.gradeLevel
      if (section === null) {
        section = inferred.section
      }
    }
  }

  return {
    id: student.studentId,
    name: student.fullName,
    studentCode: student.studentCode,
    grade: formatGradeLevel(gradeLevel),
    gradeLevel,
    classroom: formatClassroomSection(section),
    classroomName: student.classroomName,
    section,
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

  return Array.from(rows.values()).sort((a, b) =>
    compareGradeLevels(a.gradeLevel, b.gradeLevel),
  )
}

function compareClassroomLabels(a: string, b: string): number {
  const infA = inferGradeAndSection(a)
  const infB = inferGradeAndSection(b)
  if (infA && infB) {
    const ordA = GRADE_SORT_ORDER[infA.gradeLevel] ?? 99
    const ordB = GRADE_SORT_ORDER[infB.gradeLevel] ?? 99
    if (ordA !== ordB) return ordA - ordB
    if (infA.section !== infB.section) return infA.section - infB.section
  }
  return a.localeCompare(b, "th", { numeric: true })
}

export function createStudentFilterOptions(
  students: StudentListItem[],
  schoolClassrooms?: Array<{
    id?: string
    name: string
    gradeLevel?: string | null
    grade_level?: string | null
    section?: number | null
  }>,
): StudentFilterOptions {
  const grades = new Map<string, { value: string; label: string; count: number }>()
  const classrooms = new Map<
    string,
    { value: string; label: string; count: number; gradeLevel?: string }
  >()
  const statuses = new Map<string, { value: string; label: string; count: number }>()

  for (const student of students) {
    if (student.gradeLevel) {
      const current = grades.get(student.gradeLevel) ?? {
        value: student.gradeLevel,
        label: formatFullGradeLevel(student.gradeLevel),
        count: 0,
      }
      current.count += 1
      grades.set(student.gradeLevel, current)
    }

    const classroomLabel =
      student.classroomName ||
      formatClassroomLabel({
        gradeLevel: student.gradeLevel,
        section: student.section,
      })

    if (classroomLabel && classroomLabel !== "-") {
      const value = classroomLabel
      const current = classrooms.get(value) ?? {
        value,
        label: classroomLabel,
        count: 0,
        gradeLevel:
          student.gradeLevel ||
          inferGradeAndSection(classroomLabel)?.gradeLevel ||
          undefined,
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

  // Incorporate registered school classrooms even if student worklist has 0 currently active
  if (schoolClassrooms) {
    for (const c of schoolClassrooms) {
      const grade = c.gradeLevel || c.grade_level
      if (grade && !grades.has(grade)) {
        grades.set(grade, {
          value: grade,
          label: formatFullGradeLevel(grade),
          count: 0,
        })
      }

      const label =
        c.name ||
        formatClassroomLabel({
          gradeLevel: grade,
          section: c.section,
        })

      if (label && label !== "-" && !classrooms.has(label)) {
        classrooms.set(label, {
          value: label,
          label,
          count: 0,
          gradeLevel: grade || inferGradeAndSection(label)?.gradeLevel || undefined,
        })
      }
    }
  }

  return {
    grades: Array.from(grades.values()).sort((a, b) => compareGradeLevels(a.value, b.value)),
    classrooms: Array.from(classrooms.values()).sort((a, b) =>
      compareClassroomLabels(a.label, b.label),
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
  const filterGrade = filters.grade.trim().toLowerCase()
  const filterClassroom = filters.classroom.trim().toLowerCase()
  const filterStatus = filters.status.trim().toLowerCase()

  return students.filter((student) => {
    const matchesQuery =
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.studentCode.toLowerCase().includes(query) ||
      student.guardian.toLowerCase().includes(query)

    const studentGrade = (student.gradeLevel || "").toLowerCase()
    const matchesGrade = !filterGrade || studentGrade === filterGrade

    let matchesClassroom = true
    if (filterClassroom) {
      const cName = (student.classroomName || "").toLowerCase()
      const cFormatted = formatClassroomLabel({
        gradeLevel: student.gradeLevel,
        section: student.section,
        classroomName: student.classroomName,
      }).toLowerCase()
      const cSection = String(student.section ?? "")
      const cGradeSlashSection =
        student.gradeLevel && student.section !== null
          ? `${student.gradeLevel}/${student.section}`.toLowerCase()
          : ""

      matchesClassroom =
        cName === filterClassroom ||
        cFormatted === filterClassroom ||
        cSection === filterClassroom ||
        cGradeSlashSection === filterClassroom ||
        cName.includes(filterClassroom)
    }

    const matchesStatus = !filterStatus || student.riskLevel === filterStatus

    return matchesQuery && matchesGrade && matchesClassroom && matchesStatus
  })
}

export function pickFeaturedStudent(students: StudentListItem[]) {
  return students[0] ?? null
}

export function createStudentPageHref(filters: StudentFilterState) {
  return (page: number) => {
    const params = new URLSearchParams()

    if (filters.q) params.set("q", filters.q)
    if (filters.grade) params.set("grade", filters.grade)
    if (filters.classroom) params.set("classroom", filters.classroom)
    if (filters.status) params.set("status", filters.status)
    if (page > 1) params.set("page", String(page))

    const query = params.toString()
    return query ? `/students?${query}` : "/students"
  }
}
