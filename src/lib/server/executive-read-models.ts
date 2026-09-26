import "server-only"

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

export type ExecutiveInsights = {
  topAbsence: TopAbsentStudent[]
  topLowGpa: TopLowGpaStudent[]
  factors: RiskFactorCount[]
  factorsTotalStudents: number
  classrooms: ClassroomRiskItem[]
  trend: RiskTrendPoint[]
}

const emptyInsights: ExecutiveInsights = {
  topAbsence: [],
  topLowGpa: [],
  factors: [],
  factorsTotalStudents: 0,
  classrooms: [],
  trend: [],
}

export async function getExecutiveInsights(): Promise<ExecutiveInsights> {
  try {
    const [worklist, academic, factors, classrooms, trend] = await Promise.all([
      getStudentWorklist({ limit: 500 }).catch(() => []),
      getAcademicDashboard().catch(() => null),
      getRiskFactorDistribution().catch(() => ({ factors: [], totalStudents: 0 })),
      getClassroomRiskBreakdown().catch(() => []),
      getRiskTrendHistory().catch(() => []),
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
    for (const row of academic?.students ?? []) {
      if (row.gradePoint === null || row.gradePoint === undefined) continue
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
      factors: factors.factors.slice(0, 6),
      factorsTotalStudents: factors.totalStudents,
      classrooms: [...classrooms]
        .sort(
          (a, b) =>
            b.highRiskCount + b.watchRiskCount - (a.highRiskCount + a.watchRiskCount),
        )
        .slice(0, 12),
      trend: trend.slice(-6),
    }
  } catch {
    return emptyInsights
  }
}
