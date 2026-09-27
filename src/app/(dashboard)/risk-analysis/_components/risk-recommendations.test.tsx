import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"

import { RiskRecommendations } from "./risk-recommendations"

function makeStudent(overrides: Partial<StudentWorklistItem> = {}): StudentWorklistItem {
  return {
    studentId: "11111111-1111-4111-8111-111111111111",
    studentCode: "STD001",
    fullName: "สมชาย ใจดี",
    photoUrl: null,
    classroomId: null,
    classroomName: "ม.1/1",
    gradeLevel: "m1",
    section: 1,
    studentNumber: 1,
    primaryGuardianName: null,
    primaryGuardianPhone: null,
    riskLevel: "high",
    riskScore: 80,
    riskTrend: null,
    openSupportCount: 0,
    activePlanCount: 0,
    openActionCount: 0,
    activeFlagCount: 0,
    nextDueDate: null,
    absentDays30d: 0,
    lateDays30d: 0,
    recordedDays30d: 0,
    attendanceRate30d: null,
    priorityScore: 80,
    ...overrides,
  }
}

describe("RiskRecommendations IDP suggestion (FR-08-09)", () => {
  it("renders the IDP suggestion with the real count and links to plan creation", () => {
    render(<RiskRecommendations students={[makeStudent()]} idpSuggestionCount={3} />)

    expect(screen.getByText("แนะนำให้สร้าง IDP")).toBeInTheDocument()
    expect(screen.getByText("นักเรียนเสี่ยงที่ยังไม่มีแผนพัฒนา")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /แนะนำให้สร้าง IDP/ })).toHaveAttribute(
      "href",
      "/development-plans/new",
    )
  })

  it("renders a zero count honestly when every at-risk student has a plan", () => {
    render(<RiskRecommendations students={[makeStudent()]} idpSuggestionCount={0} />)

    const link = screen.getByRole("link", { name: /แนะนำให้สร้าง IDP/ })
    expect(within(link).getByText("0")).toBeInTheDocument()
  })
})
