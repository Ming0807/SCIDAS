import "server-only"

import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "./current-user"
import { getAcademicDashboard } from "./academic-read-models"
import {
  getClassroomRiskBreakdown,
  getRiskFactorDistribution,
  getRiskTrendHistory,
  type ClassroomRiskItem,
  type RiskFactorCount,
  type RiskTrendPoint,
} from "./risk-read-models"
import { getStudentWorklist } from "./student-care-read-models"

export type TopAbsentStudent = {
  studentId: string
  fullName: string
  classroomName: string | null
  absentDays30d: number
  attendanceRate30d: number | null
}

export type TopLowGpaStudent = {
  studentId: string
  fullName: string
  classroomName: string | null
  averageGpa: number
  subjectCount: number
}

export type ClassroomOption = {
  id: string
  name: string
}

export type SemesterOption = {
  id: string
  name: string
  year: number | null
  isCurrent: boolean
}

export type ExecutiveInsights = {
  topAbsence: TopAbsentStudent[]
  topLowGpa: TopLowGpaStudent[]
  gpaSemesterLabel: string | null
  factors: RiskFactorCount[]
  factorsTotalStudents: number
  classrooms: ClassroomRiskItem[]
  classroomOptions: ClassroomOption[]
  activeClassroomId: string | null
  semesterOptions: SemesterOption[]
  activeSemesterId: string | null
  trend: RiskTrendPoint[]
}

const emptyInsights: ExecutiveInsights = {
  topAbsence: [],
  topLowGpa: [],
  gpaSemesterLabel: null,
  factors: [],
  factorsTotalStudents: 0,
  classrooms: [],
  classroomOptions: [],
  activeClassroomId: null,
  semesterOptions: [],
  activeSemesterId: null,
  trend: [],
}

export async function getClassroomOptions(): Promise<ClassroomOption[]> {
  try {
    const context = await getCurrentUserContext()
    const client = await createClient()
    const { data, error } = await client
      .from("classrooms")
      .select("id, name")
      .eq("school_id", context.schoolId)
      .eq("is_active", true)
      .order("grade_level", { ascending: true })
      .order("section", { ascending: true })
    if (error || !data) return []
    return data.map((c) => ({ id: c.id, name: c.name ?? "-" }))
  } catch {
    return []
  }
}

const uuidShape = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getSemesterOptions(): Promise<SemesterOption[]> {
  try {
    const context = await getCurrentUserContext()
    const client = await createClient()
    const { data, error } = await client
      .from("semesters")
      .select("id, semester, is_current, academic_years(year)")
      .eq("school_id", context.schoolId)
      .order("start_date", { ascending: false })
      .limit(10)
    if (error || !data) return []
    type Row = {
      id: string
      semester: string
      is_current: boolean
      academic_years: { year: number } | Array<{ year: number }> | null
    }
    return ((data ?? []) as Row[]).map((row) => {
      const year = Array.isArray(row.academic_years) ? row.academic_years[0]?.year : row.academic_years?.year
      const semNum = row.semester === "semester_1" ? "1" : row.semester === "semester_2" ? "2" : row.semester
      return {
        id: row.id,
        name: `ภาคเรียนที่ ${semNum}/${year ?? "-"}`,
        year: year ?? null,
        isCurrent: row.is_current,
      }
    })
  } catch {
    return []
  }
}

export async function getExecutiveInsights(options?: {
  classroomId?: string
  semesterId?: string
}): Promise<ExecutiveInsights> {
  const rawClassroomId = options?.classroomId?.trim() || null
  const classroomId = rawClassroomId && uuidShape.test(rawClassroomId) ? rawClassroomId : null
  const rawSemesterId = options?.semesterId?.trim() || null
  const requestedSemesterId = rawSemesterId && uuidShape.test(rawSemesterId) ? rawSemesterId : null
  try {
    const [worklist, semesterOptions] = await Promise.all([
      getStudentWorklist({ limit: 500, classroomId: classroomId ?? undefined }).catch(() => []),
      getSemesterOptions(),
    ])
    const activeSemester = requestedSemesterId
      ? (semesterOptions.find((s) => s.id === requestedSemesterId) ?? null)
      : (semesterOptions.find((s) => s.isCurrent) ?? semesterOptions[0] ?? null)
    const activeSemesterId = activeSemester?.id ?? null
    const [academic, factors, classrooms, trend, classroomOptions] = await Promise.all([
      getAcademicDashboard(activeSemesterId ?? undefined).catch(() => null),
      getRiskFactorDistribution().catch(() => ({ factors: [], totalStudents: 0 })),
      getClassroomRiskBreakdown().catch(() => []),
      getRiskTrendHistory().catch(() => []),
      getClassroomOptions(),
    ])

    const topAbsence: TopAbsentStudent[] = [...worklist]
      .filter((s) => s.absentDays30d > 0)
      .sort((a, b) => b.absentDays30d - a.absentDays30d || (a.attendanceRate30d ?? 100) - (b.attendanceRate30d ?? 100))
      .slice(0, 10)
      .map((s) => ({
        studentId: s.studentId,
        fullName: s.fullName,
        classroomName: s.classroomName,
        absentDays30d: s.absentDays30d,
        attendanceRate30d: s.attendanceRate30d,
      }))

    const gpaByStudent = new Map<
      string,
      { fullName: string; classroomName: string | null; total: number; count: number }
    >()
    const activeClassroomName = classroomId
      ? (classroomOptions.find((c) => c.id === classroomId)?.name ?? null)
      : null
    for (const row of academic?.students ?? []) {
      if (row.gradePoint === null || row.gradePoint === undefined) continue
      if (activeClassroomName && row.classroomName !== activeClassroomName) continue
      const entry = gpaByStudent.get(row.studentId) ?? {
        fullName: row.studentName,
        classroomName: row.classroomName,
        total: 0,
        count: 0,
      }
      entry.total += Number(row.gradePoint)
      entry.count += 1
      gpaByStudent.set(row.studentId, entry)
    }
    const topLowGpa: TopLowGpaStudent[] = [...gpaByStudent.entries()]
      .map(([studentId, entry]) => ({
        studentId,
        fullName: entry.fullName,
        classroomName: entry.classroomName,
        averageGpa: Math.round((entry.total / entry.count) * 100) / 100,
        subjectCount: entry.count,
      }))
      .sort((a, b) => a.averageGpa - b.averageGpa)
      .slice(0, 10)

    return {
      topAbsence,
      topLowGpa,
      gpaSemesterLabel: activeSemester?.name ?? null,
      factors: factors.factors.slice(0, 6),
      factorsTotalStudents: factors.totalStudents,
      classrooms: [...classrooms]
        .sort(
          (a, b) =>
            b.highRiskCount + b.watchRiskCount - (a.highRiskCount + a.watchRiskCount),
        )
        .slice(0, 12),
      classroomOptions,
      activeClassroomId: classroomId,
      semesterOptions,
      activeSemesterId,
      trend: trend.slice(-6),
    }
  } catch {
    return emptyInsights
  }
}
