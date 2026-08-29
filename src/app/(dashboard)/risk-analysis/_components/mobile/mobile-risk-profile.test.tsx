import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"
import type {
  RiskDimensionBenchmark,
  RiskFactorDistribution,
  StudentRiskFactorData,
} from "@/lib/server/risk-read-models"

import { MobileRiskProfile } from "./mobile-risk-profile"

const students: StudentWorklistItem[] = [
  {
    studentId: "student-1",
    studentCode: "S001",
    fullName: "สมชาย ใจดี",
    photoUrl: null,
    classroomName: "ม.1/1",
    gradeLevel: "m1",
    section: 1,
    studentNumber: 1,
    primaryGuardianName: null,
    primaryGuardianPhone: null,
    riskLevel: "watch",
    riskScore: 35,
    riskTrend: null,
    openSupportCount: 0,
    activePlanCount: 0,
    openActionCount: 0,
    activeFlagCount: 0,
    nextDueDate: null,
    absentDays30d: 0,
    lateDays30d: 0,
    recordedDays30d: 10,
    attendanceRate30d: 100,
    priorityScore: 35,
  },
]

const aggregateFactors: RiskFactorDistribution = {
  factors: [{ factorKey: "frequent_absence", factorLabel: "ขาดเรียนบ่อย", count: 2 }],
  totalStudents: 4,
}

const benchmarks: RiskDimensionBenchmark[] = [
  {
    dimensionKey: "frequent_absence",
    dimensionLabel: "ขาดเรียนบ่อย",
    averageScore: 8,
    highRiskCount: 1,
    watchRiskCount: 1,
  },
]

const studentFactors: Record<string, StudentRiskFactorData> = {
  "student-1": {
    hasAssessment: true,
    factors: [
      {
        factorKey: "frequent_absence",
        factorLabel: "ขาดเรียนบ่อย",
        score: 12,
        evidence: "ขาดเรียน 4 วัน",
      },
    ],
  },
}

describe("MobileRiskProfile", () => {
  it("switches from school aggregates to the selected student's factors and benchmarks", () => {
    render(
      <MobileRiskProfile
        students={students}
        riskCounts={{ high: 0, watch: 1, normal: 3, total: 4 }}
        factorDistribution={aggregateFactors}
        dimensionBenchmarks={benchmarks}
        studentRiskFactors={studentFactors}
      />,
    )

    expect(screen.getByText("สัดส่วนปัจจัยความเสี่ยงของโรงเรียน")).toBeInTheDocument()
    expect(screen.getByText("2 คน (50% ของโรงเรียน)")).toBeInTheDocument()
    expect(screen.getByText("เกณฑ์เปรียบเทียบรายมิติของโรงเรียน")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("เลือกนักเรียนเพื่อดูการวิเคราะห์รายบุคคล"), {
      target: { value: "student-1" },
    })

    expect(screen.getByText("ปัจจัยเสี่ยงที่เกี่ยวข้องกับ สมชาย ใจดี")).toBeInTheDocument()
    expect(screen.getByText("12 คะแนน")).toBeInTheDocument()
    expect(screen.getByText("เปรียบเทียบความเสี่ยงรายมิติ")).toBeInTheDocument()
    expect(screen.queryByText("2 คน (50% ของโรงเรียน)")).not.toBeInTheDocument()
  })

  it("shows an honest empty state when the selected student has no assessment", () => {
    render(
      <MobileRiskProfile
        students={students}
        riskCounts={{ high: 0, watch: 1, normal: 3, total: 4 }}
        factorDistribution={aggregateFactors}
        dimensionBenchmarks={benchmarks}
        studentRiskFactors={{
          "student-1": { hasAssessment: false, factors: [] },
        }}
      />,
    )

    fireEvent.change(screen.getByLabelText("เลือกนักเรียนเพื่อดูการวิเคราะห์รายบุคคล"), {
      target: { value: "student-1" },
    })

    expect(screen.getAllByText("ยังไม่มีผลประเมินของนักเรียน")).toHaveLength(3)
    expect(screen.queryByText("2 คน (50% ของโรงเรียน)")).not.toBeInTheDocument()
  })
})
