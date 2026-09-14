import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/lib/server/staff-read-models", () => ({
  getStaffManagementData: vi.fn(),
}))

vi.mock("./_components/staff-manager", () => ({
  StaffManager: vi.fn(({ initialData }) => (
    <div data-testid="staff-manager">
      Staff count: {initialData?.staff?.length ?? 0}
    </div>
  )),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { getStaffManagementData } from "@/lib/server/staff-read-models"
import StaffManagementPage from "./page"

describe("StaffManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders login required state when not authenticated", async () => {
    vi.mocked(getCurrentUserContext).mockRejectedValueOnce(new Error("UNAUTHORIZED"))

    const Page = await StaffManagementPage()
    render(Page)

    expect(screen.getByText("จำเป็นต้องเข้าสู่ระบบ")).toBeDefined()
    expect(screen.getByText("เข้าสู่ระบบ")).toBeDefined()
  })

  it("renders permission denied state when role is not authorized", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "u1",
      schoolId: "sch-1",
      role: "subject_teacher" as never,
      profileId: "p1",
      studentId: null,
    })

    const Page = await StaffManagementPage()
    render(Page)

    expect(screen.getByText("ไม่มีสิทธิ์เข้าถึงหน้านี้")).toBeDefined()
    expect(screen.getByText("กลับไปยังหน้าตั้งค่า")).toBeDefined()
  })

  it("renders error state when data fetching fails", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "u1",
      schoolId: "sch-1",
      role: "admin",
      profileId: "p1",
      studentId: null,
    })

    vi.mocked(getStaffManagementData).mockRejectedValueOnce(new Error("Database connection lost"))

    const Page = await StaffManagementPage()
    render(Page)

    expect(screen.getByText("เกิดข้อผิดพลาดในการโหลดข้อมูลบุคลากร")).toBeDefined()
    expect(screen.getByText("Database connection lost")).toBeDefined()
  })

  it("renders staff manager when user has leadership role and data loads", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "u1",
      schoolId: "sch-1",
      role: "admin",
      profileId: "p1",
      studentId: null,
    })

    vi.mocked(getStaffManagementData).mockResolvedValueOnce({
      staff: [
        {
          id: "prof-1",
          firstName: "สมชาย",
          lastName: "ใจดี",
          fullName: "สมชาย ใจดี",
          email: "somchai@school.ac.th",
          phone: null,
          position: null,
          department: null,
          role: "admin",
          roleLabel: "ผู้ดูแลระบบ",
          isActive: true,
          lastLoginAt: null,
          assignedClassrooms: [],
        },
      ],
      classrooms: [],
      currentUserRole: "admin",
      currentProfileId: "p1",
      canManage: true,
      metrics: {
        totalStaff: 1,
        activeStaff: 1,
        teachersCount: 0,
        counselorsCount: 0,
        leadershipCount: 1,
        unassignedHomeroomsCount: 0,
      },
    })

    const Page = await StaffManagementPage()
    render(Page)

    expect(screen.getByTestId("staff-manager")).toBeDefined()
    expect(screen.getByText("Staff count: 1")).toBeDefined()
  })
})
