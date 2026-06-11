import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import StudentsPage from "./page"
import StudentProfilePage from "./[id]/page"

// Mock router
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
    }
  },
}))

vi.mock("@/lib/server/student-care-read-models", () => ({
  getStudentCareProfile: vi.fn(async () => ({
    studentId: "S001",
    studentCode: "12345",
    fullName: "เด็กชายกฤษฎา ใจดี",
    firstName: "กฤษฎา",
    lastName: "ใจดี",
    prefix: "เด็กชาย",
    nickname: "กฤษ",
    gender: "male",
    photoUrl: "",
    status: "active",
    classroomName: "ป.5/1",
    gradeLevel: "p5",
    section: 1,
    studentNumber: 8,
    primaryGuardianName: "นางสาวอรพิน ใจดี",
    primaryGuardianPhone: "089-123-4567",
    travelMethod: "รถรับส่ง",
    distanceToSchoolKm: 3.5,
    riskLevel: "normal",
    riskScore: 2,
    riskTrend: null,
    openSupportCount: 0,
    activePlanCount: 0,
    openActionCount: 1,
    activeFlagCount: 0,
    nextDueDate: "2026-06-20",
    absentDays30d: 0,
    lateDays30d: 0,
    recordedDays30d: 20,
    attendanceRate30d: 100,
    priorityScore: 2,
  })),
  getStudentActionItems: vi.fn(async () => [
    {
      id: "A001",
      studentId: "S001",
      studentName: "เด็กชายกฤษฎา ใจดี",
      title: "ติดตามผลการดูแล",
      description: null,
      category: "support",
      priority: "medium",
      status: "todo",
      dueDate: "2026-06-20",
      assignedTo: null,
      sourceTable: "support_records",
      sourceId: "SR001",
    },
  ]),
  getStudentAttachments: vi.fn(async () => []),
  getStudentNotes: vi.fn(async () => []),
  getStudentTimeline: vi.fn(async () => []),
  getStudentWorklist: vi.fn(async () => [
    {
      studentId: "S001",
      studentCode: "12345",
      fullName: "เด็กชายกฤษฎา ใจดี",
      photoUrl: "",
      classroomName: "ป.5/1",
      gradeLevel: "p5",
      section: 1,
      studentNumber: 8,
      primaryGuardianName: "นางสาวอรพิน ใจดี",
      primaryGuardianPhone: "089-123-4567",
      riskLevel: "normal",
      riskScore: 2,
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
      priorityScore: 2,
    },
  ]),
}))

describe("Students Module", () => {
  describe("Students List Page", () => {
    it("renders the students heading and data table", async () => {
      const Page = await StudentsPage({ searchParams: Promise.resolve({}) })
      render(Page)

      expect(screen.getByRole("heading", { name: "ข้อมูลนักเรียนและการจัดการ" })).toBeDefined()
      expect(screen.getAllByPlaceholderText("ค้นหาชื่อนักเรียน, เลขประจำตัว, ผู้ปกครอง...").length).toBeGreaterThan(0)
      expect(screen.getAllByText("เด็กชายกฤษฎา ใจดี").length).toBeGreaterThan(0)
    })
  })

  describe("Student Profile Page", () => {
    it("renders the student care profile and connected sections", async () => {
      const Page = await StudentProfilePage({ params: Promise.resolve({ id: "S001" }) })
      render(Page)
      
      expect(screen.getByRole("heading", { name: "เด็กชายกฤษฎา ใจดี" })).toBeDefined()
      expect(screen.getByRole("heading", { name: "ข้อมูลนักเรียน" })).toBeDefined()
      expect(screen.getByRole("heading", { name: "งานดูแลของนักเรียน" })).toBeDefined()
      expect(screen.getByRole("heading", { name: "บันทึกทีมดูแล" })).toBeDefined()
      expect(screen.getByRole("heading", { name: "ไทม์ไลน์การดูแล" })).toBeDefined()
      expect(screen.getByRole("heading", { name: "หลักฐานและไฟล์แนบ" })).toBeDefined()
      expect(screen.getByText("ติดตามผลการดูแล")).toBeDefined()
    })
  })
})
