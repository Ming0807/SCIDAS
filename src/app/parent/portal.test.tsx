import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/server/parent-read-models", () => ({
  getParentChildren: vi.fn(),
  getParentChildDetail: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`)
  }),
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

import { getParentChildren, getParentChildDetail } from "@/lib/server/parent-read-models"
import { getCurrentUserContext } from "@/lib/server/current-user"
import ParentHomePage from "./page"
import ParentChildPage from "./[studentId]/page"
import ParentLayout from "./layout"

describe("Parent portal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("layout guard", () => {
    it("redirects non-parent roles to the dashboard", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      await expect(ParentLayout({ children: null })).rejects.toThrow("NEXT_REDIRECT")
    })

    it("renders the portal shell for linked parents", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "parent",
        profileId: "prof-1",
        studentId: null,
      })

      const node = await ParentLayout({ children: <p>เนื้อหา</p> })
      render(node)
      expect(screen.getByText("พอร์ทัลผู้ปกครอง")).toBeInTheDocument()
      expect(screen.getByText("เนื้อหา")).toBeInTheDocument()
    })
  })

  describe("home page", () => {
    it("lists linked children with detail links", async () => {
      vi.mocked(getParentChildren).mockResolvedValueOnce([
        {
          studentId: "stu-1",
          studentCode: "S001",
          fullName: "เด็กชายทดสอบ",
          photoUrl: null,
          classroomName: "ป.4/1",
          relation: "father",
        },
      ])

      render(await ParentHomePage())

      expect(screen.getByText("เด็กชายทดสอบ")).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /เด็กชายทดสอบ/ }).getAttribute("href")).toBe(
        "/parent/stu-1",
      )
    })

    it("shows the contact-teacher empty state when unlinked", async () => {
      vi.mocked(getParentChildren).mockResolvedValueOnce([])

      render(await ParentHomePage())

      expect(screen.getByText("ยังไม่มีข้อมูลบุตรหลาน")).toBeInTheDocument()
    })
  })

  describe("child detail page", () => {
    const profile = {
      studentId: "stu-1",
      studentCode: "S001",
      fullName: "เด็กชายทดสอบ",
      firstName: "ทดสอบ",
      lastName: "ทดสอบ",
      prefix: "เด็กชาย",
      nickname: null,
      gender: "male" as const,
      photoUrl: null,
      status: "active" as const,
      classroomName: "ป.4/1",
      gradeLevel: "p4" as const,
      section: 1,
      studentNumber: 5,
      primaryGuardianName: null,
      primaryGuardianPhone: null,
      travelMethod: null,
      distanceToSchoolKm: null,
      riskLevel: "normal" as const,
      riskScore: 10,
      riskTrend: null,
      openSupportCount: 0,
      activePlanCount: 0,
      openActionCount: 0,
      activeFlagCount: 0,
      nextDueDate: null,
      attendanceRate30d: 95,
      absentDays30d: 1,
      lateDays30d: 0,
      recordedDays30d: 20,
      priorityScore: 10,
    }

    it("renders read-only sections without any edit controls", async () => {
      vi.mocked(getParentChildDetail).mockResolvedValueOnce({
        profile,
        attendance: [{ date: "2026-09-20", status: "present" }],
        scores: [{ subjectName: "คณิตศาสตร์", totalScore: 72, grade: "3" }],
        behaviors: [],
        supportCases: [],
        plans: [],
        teacherContact: null,
      })

      render(await ParentChildPage({ params: Promise.resolve({ studentId: "stu-1" }) }))

      expect(screen.getAllByText("เด็กชายทดสอบ").length).toBeGreaterThan(0)
      expect(screen.getByText("การมาเรียน 30 วันล่าสุด")).toBeInTheDocument()
      expect(screen.getByText("คณิตศาสตร์")).toBeInTheDocument()
      // Read-only: no staff mutation affordances leak into the portal.
      expect(screen.queryByText("บันทึก")).toBeNull()
      expect(screen.queryByText("แก้ไข")).toBeNull()
      expect(screen.queryByText("ลบ")).toBeNull()
    })

    it("renders teacher contact button and consent acknowledgment affordances", async () => {
      vi.mocked(getParentChildDetail).mockResolvedValueOnce({
        profile: {
          ...profile,
          riskLevel: "high" as const,
          riskScore: 65,
        },
        attendance: [],
        scores: [],
        behaviors: [],
        supportCases: [
          {
            id: "s-1",
            title: "การให้คำปรึกษาพฤติกรรม",
            status: "pending",
            startedAt: null,
            consentStatus: "pending_ack",
            acknowledgedAt: null,
          },
        ],
        plans: [
          {
            id: "p-1",
            title: "แผนพัฒนาทักษะการอ่าน",
            status: "draft",
            consentStatus: "acknowledged",
            acknowledgedAt: "2026-09-25",
          },
        ],
        teacherContact: {
          homeroomTeacher: {
            name: "ครูมานี สดใส",
            phone: "0812345678",
            email: "manee@school.ac.th",
            position: "ครูประจำชั้น",
          },
          coTeacher: null,
          schoolContact: {
            name: "โรงเรียนอนุบาลวัดทดสอบ",
            phone: "021234567",
            email: "info@school.ac.th",
            address: "123 กรุงเทพมหานคร",
          },
        },
      })

      render(await ParentChildPage({ params: Promise.resolve({ studentId: "stu-1" }) }))

      // Teacher contact button is present in header
      expect(screen.getByText("ติดต่อครูประจำชั้น")).toBeInTheDocument()

      // High risk empathetic guidance banner is rendered
      expect(screen.getByText("ความร่วมมือในการดูแลนักเรียน")).toBeInTheDocument()

      // Pending consent acknowledgment button
      expect(screen.getByText("ยืนยันรับทราบ")).toBeInTheDocument()

      // Acknowledged badge
      expect(screen.getByText(/รับทราบแล้ว/)).toBeInTheDocument()
    })
  })
})
