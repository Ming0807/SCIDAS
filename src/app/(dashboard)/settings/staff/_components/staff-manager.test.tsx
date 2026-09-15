import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { StaffManager } from "./staff-manager"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock("@/app/actions/staff.actions", () => ({
  assignHomeroomTeacherAction: vi.fn(),
  updateStaffRoleAction: vi.fn(),
  updateStaffStatusAction: vi.fn(),
}))

describe("StaffManager component", () => {
  it("renders safely with null or undefined initialData", () => {
    const { container } = render(<StaffManager initialData={null} />)
    expect(container).toBeDefined()
  })

  it("renders safely with sample staff and classrooms data", () => {
    const sampleData = {
      staff: [
        {
          id: "p1",
          firstName: "สมชาย",
          lastName: "ใจดี",
          fullName: "สมชาย ใจดี",
          email: "somchai@school.ac.th",
          phone: "0812345678",
          position: "ครูชำนาญการ",
          department: "วิทยาศาสตร์",
          role: "homeroom_teacher" as const,
          roleLabel: "ครูที่ปรึกษา / ครูประจำชั้น",
          isActive: true,
          lastLoginAt: null,
          assignedClassrooms: [
            {
              classroomId: "c1",
              classroomName: "ม.1/1",
              gradeLevel: "1",
              section: 1,
              assignmentType: "homeroom" as const,
            },
          ],
        },
      ],
      classrooms: [
        {
          id: "c1",
          name: "ม.1/1",
          gradeLevel: "1",
          section: 1,
          academicYearId: "ay1",
          homeroomTeacherId: "p1",
          homeroomTeacherName: "สมชาย ใจดี",
          coTeacherId: null,
          coTeacherName: null,
          isActive: true,
        },
      ],
      currentUserRole: "admin",
      currentProfileId: "p1",
      canManage: true,
      metrics: {
        totalStaff: 1,
        activeStaff: 1,
        teachersCount: 1,
        counselorsCount: 0,
        leadershipCount: 0,
        unassignedHomeroomsCount: 0,
      },
    }

    render(<StaffManager initialData={sampleData} />)
    expect(screen.getByText("สมชาย ใจดี")).toBeDefined()
  })
})
