import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

import { getStaffManagementData } from "./staff-read-models"

describe("staff-read-models", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fails if schoolId is missing", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "u1",
      schoolId: "",
      role: "admin",
      profileId: "p1",
      studentId: null,
    })

    await expect(getStaffManagementData()).rejects.toThrow("UNAUTHORIZED")
  })

  it("loads staff and classroom assignments correctly with metrics", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "u1",
      schoolId: "sch-1",
      role: "admin",
      profileId: "p1",
      studentId: null,
    })

    const mockProfiles = [
      {
        id: "prof-1",
        first_name: "สมชาย",
        last_name: "ใจดี",
        email: "somchai@school.ac.th",
        phone: "0812345678",
        position: "ครูชำนาญการ",
        department: "วิทยาศาสตร์",
        role: "homeroom_teacher",
        is_active: true,
        last_login_at: "2026-09-12T10:00:00Z",
      },
      {
        id: "prof-2",
        first_name: "วิภา",
        last_name: "สุขใจ",
        email: "wipa@school.ac.th",
        phone: null,
        position: "ครูแนะแนว",
        department: "แนะแนว",
        role: "counselor",
        is_active: true,
        last_login_at: null,
      },
    ]

    const mockClassrooms = [
      {
        id: "cls-1",
        name: "ม.1/1",
        grade_level: 1,
        section: 1,
        academic_year_id: "ay-1",
        is_active: true,
        homeroom_teacher_id: "prof-1",
        co_teacher_id: null,
        homeroom_teacher: { first_name: "สมชาย", last_name: "ใจดี" },
        co_teacher: null,
      },
      {
        id: "cls-2",
        name: "ม.1/2",
        grade_level: 1,
        section: 2,
        academic_year_id: "ay-1",
        is_active: true,
        homeroom_teacher_id: null,
        co_teacher_id: null,
        homeroom_teacher: null,
        co_teacher: null,
      },
    ]

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({
                  data: mockProfiles,
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === "classrooms") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    order: vi.fn().mockResolvedValue({
                      data: mockClassrooms,
                      error: null,
                    }),
                  })),
                })),
              })),
            })),
          }
        }
        return {}
      }),
    }

    vi.mocked(createClient).mockResolvedValueOnce(mockSupabase as never)

    const data = await getStaffManagementData()

    expect(data.staff.length).toBe(2)
    expect(data.classrooms.length).toBe(2)
    expect(data.canManage).toBe(true)
    expect(data.currentProfileId).toBe("p1")
    expect(data.metrics.totalStaff).toBe(2)
    expect(data.metrics.activeStaff).toBe(2)
    expect(data.metrics.teachersCount).toBe(1)
    expect(data.metrics.counselorsCount).toBe(1)
    expect(data.metrics.unassignedHomeroomsCount).toBe(1) // cls-2 has no homeroom teacher

    // Check that prof-1 has cls-1 assigned as homeroom
    const teacher = data.staff.find((s) => s.id === "prof-1")
    expect(teacher?.assignedClassrooms).toHaveLength(1)
    expect(teacher?.assignedClassrooms[0]?.assignmentType).toBe("homeroom")
  })
})
