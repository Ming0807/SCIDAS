import { describe, it, expect, vi, beforeEach } from "vitest"

import { getExecutiveInsights } from "./executive-read-models"

vi.mock("./academic-read-models", () => ({
  getAcademicDashboard: vi.fn(),
}))

vi.mock("./risk-read-models", () => ({
  getClassroomRiskBreakdown: vi.fn(),
  getRiskFactorDistribution: vi.fn(),
  getRiskTrendHistory: vi.fn(),
}))

vi.mock("./student-care-read-models", () => ({
  getStudentWorklist: vi.fn(),
}))

import { getAcademicDashboard } from "./academic-read-models"
import {
  getClassroomRiskBreakdown,
  getRiskFactorDistribution,
  getRiskTrendHistory,
} from "./risk-read-models"
import { getStudentWorklist, type StudentWorklistItem } from "./student-care-read-models"

function worklistStudent(overrides: Partial<StudentWorklistItem> = {}): StudentWorklistItem {
  return {
    studentId: "stu-1",
    studentCode: "S001",
    fullName: "นักเรียน ทดสอบ",
    photoUrl: null,
    classroomName: "ป.4/1",
    gradeLevel: "p4",
    section: 1,
    studentNumber: 1,
    primaryGuardianName: null,
    primaryGuardianPhone: null,
    riskLevel: "normal",
    riskScore: 10,
    riskTrend: null,
    openSupportCount: 0,
    activePlanCount: 0,
    openActionCount: 0,
    activeFlagCount: 0,
    nextDueDate: null,
    absentDays30d: 0,
    lateDays30d: 0,
    recordedDays30d: 20,
    attendanceRate30d: 100,
    priorityScore: 10,
    ...overrides,
  }
}

describe("getExecutiveInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("ranks top absence and lowest GPA with limits", async () => {
    vi.mocked(getStudentWorklist).mockResolvedValueOnce([
      worklistStudent({ studentId: "a", fullName: "ขาดเยอะ", absentDays30d: 8, attendanceRate30d: 60 }),
      worklistStudent({ studentId: "b", fullName: "ขาดน้อย", absentDays30d: 2, attendanceRate30d: 90 }),
      worklistStudent({ studentId: "c", fullName: "ไม่ขาด", absentDays30d: 0 }),
    ])
    vi.mocked(getAcademicDashboard).mockResolvedValueOnce({
      summary: {
        totalStudents: 2,
        averageGpa: 2.5,
        studentsAbove3: 1,
        studentsBelow2: 1,
        topSubject: null,
        topSubjectAvg: null,
        weakestSubject: null,
        weakestSubjectAvg: null,
      },
      students: [
        { id: "s1", studentId: "a", studentName: "ขาดเยอะ", studentCode: null, gradeLevel: null, classroomName: null, subjectName: "คณิต", midtermScore: null, finalScore: null, classworkScore: null, totalScore: null, grade: null, gradePoint: 1.0 },
        { id: "s2", studentId: "b", studentName: "ขาดน้อย", studentCode: null, gradeLevel: null, classroomName: null, subjectName: "คณิต", midtermScore: null, finalScore: null, classworkScore: null, totalScore: null, grade: null, gradePoint: 3.5 },
      ],
    } as never)
    vi.mocked(getRiskFactorDistribution).mockResolvedValueOnce({ factors: [], totalStudents: 0 })
    vi.mocked(getClassroomRiskBreakdown).mockResolvedValueOnce([])
    vi.mocked(getRiskTrendHistory).mockResolvedValueOnce([])

    const result = await getExecutiveInsights()

    expect(result.topAbsence.map((s) => s.studentId)).toEqual(["a", "b"])
    expect(result.topLowGpa.map((s) => s.studentId)).toEqual(["a", "b"])
    expect(result.topLowGpa[0]?.averageGpa).toBe(1)
  })

  it("returns empty insights when every source fails", async () => {
    vi.mocked(getStudentWorklist).mockRejectedValueOnce(new Error("db down"))
    vi.mocked(getAcademicDashboard).mockRejectedValueOnce(new Error("db down"))
    vi.mocked(getRiskFactorDistribution).mockRejectedValueOnce(new Error("db down"))
    vi.mocked(getClassroomRiskBreakdown).mockRejectedValueOnce(new Error("db down"))
    vi.mocked(getRiskTrendHistory).mockRejectedValueOnce(new Error("db down"))

    const result = await getExecutiveInsights()

    expect(result.topAbsence).toEqual([])
    expect(result.topLowGpa).toEqual([])
    expect(result.factors).toEqual([])
    expect(result.classrooms).toEqual([])
    expect(result.trend).toEqual([])
  })
})
