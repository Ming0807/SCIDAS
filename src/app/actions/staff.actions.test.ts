import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("@/lib/server/audit-logger", () => ({
  logAudit: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { logAudit } from "@/lib/server/audit-logger"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

import {
  assignHomeroomTeacherAction,
  updateStaffRoleAction,
  updateStaffStatusAction,
} from "./staff.actions"

describe("staff.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("updateStaffRoleAction", () => {
    it("fails with FORBIDDEN if caller is a teacher", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-teacher",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-teacher",
        studentId: null,
      })

      const result = await updateStaffRoleAction({
        profileId: "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc",
        newRole: "counselor",
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with CONFLICT if admin attempts to demote themselves", async () => {
      const selfId = "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc"
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: selfId,
        schoolId: "sch-1",
        role: "admin",
        profileId: selfId,
        studentId: null,
      })

      const result = await updateStaffRoleAction({
        profileId: selfId,
        newRole: "subject_teacher",
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("CONFLICT")
      }
    })

    it("successfully updates role and logs audit", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "admin-user",
        schoolId: "sch-1",
        role: "admin",
        profileId: "admin-prof",
        studentId: null,
      })

      const targetId = "d3d6c7b0-8c2d-4b8c-8f9d-123456789abc"

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "profiles") {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: targetId,
                        role: "subject_teacher",
                        first_name: "กานต์",
                        last_name: "ใจดี",
                        school_id: "sch-1",
                      },
                      error: null,
                    }),
                  })),
                })),
              })),
              update: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                })),
              })),
            }
          }
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValueOnce(mockSupabase as never)

      const result = await updateStaffRoleAction({
        profileId: targetId,
        newRole: "counselor",
      })

      expect(result.ok).toBe(true)
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "UPDATE",
          tableName: "profiles",
          recordId: targetId,
        }),
      )
    })
  })

  describe("updateStaffStatusAction", () => {
    it("fails with CONFLICT if admin deactivates themselves", async () => {
      const selfId = "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc"
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: selfId,
        schoolId: "sch-1",
        role: "admin",
        profileId: selfId,
        studentId: null,
      })

      const result = await updateStaffStatusAction({
        profileId: selfId,
        isActive: false,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("CONFLICT")
      }
    })

    it("successfully updates staff active status", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "admin-user",
        schoolId: "sch-1",
        role: "admin",
        profileId: "admin-prof",
        studentId: null,
      })

      const targetId = "d3d6c7b0-8c2d-4b8c-8f9d-123456789abc"

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "profiles") {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: targetId,
                        is_active: true,
                        first_name: "กานต์",
                        last_name: "ใจดี",
                      },
                      error: null,
                    }),
                  })),
                })),
              })),
              update: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                })),
              })),
            }
          }
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValueOnce(mockSupabase as never)

      const result = await updateStaffStatusAction({
        profileId: targetId,
        isActive: false,
      })

      expect(result.ok).toBe(true)
    })
  })

  describe("assignHomeroomTeacherAction", () => {
    it("successfully assigns homeroom teacher to classroom", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "admin-user",
        schoolId: "sch-1",
        role: "director",
        profileId: "director-prof",
        studentId: null,
      })

      const classId = "e3d6c7b0-8c2d-4b8c-8f9d-123456789abc"
      const teacherId = "f3d6c7b0-8c2d-4b8c-8f9d-123456789abc"

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "classrooms") {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: classId,
                        name: "ม.1/1",
                        homeroom_teacher_id: null,
                        co_teacher_id: null,
                      },
                      error: null,
                    }),
                  })),
                })),
              })),
              update: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                })),
              })),
            }
          }
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValueOnce(mockSupabase as never)

      const result = await assignHomeroomTeacherAction({
        classroomId: classId,
        homeroomTeacherId: teacherId,
      })

      expect(result.ok).toBe(true)
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "UPDATE",
          tableName: "classrooms",
          recordId: classId,
        }),
      )
    })
  })
})
