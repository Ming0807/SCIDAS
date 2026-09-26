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

vi.mock("@/lib/server/admin-client", () => ({
  createAdminClient: vi.fn(),
}))

import { logAudit } from "@/lib/server/audit-logger"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createAdminClient } from "@/lib/server/admin-client"
import { createClient } from "@/utils/supabase/server"

import {
  assignHomeroomTeacherAction,
  inviteStaffAction,
  removeStaffAction,
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

  describe("inviteStaffAction", () => {
    const validInput = {
      email: "new.teacher@school.ac.th",
      firstName: "สมชาย",
      lastName: "ใจดี",
      role: "subject_teacher" as const,
    }

    it("fails with FORBIDDEN if caller is not leadership", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await inviteStaffAction(validInput)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with VALIDATION_ERROR for malformed email", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await inviteStaffAction({ ...validInput, email: "not-an-email" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with CONFLICT when email already exists in school", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: "prof-x" }, error: null }),
              }),
            }),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const result = await inviteStaffAction(validInput)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("CONFLICT")
    })

    it("creates auth user plus profile and returns temp password", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "profiles") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                  }),
                }),
              }),
              insert: vi.fn().mockResolvedValue({ error: null }),
            }
          }
          return {}
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const mockCreateUser = vi.fn().mockResolvedValue({
        data: { user: { id: "new-user-1" } },
        error: null,
      })
      vi.mocked(createAdminClient).mockReturnValueOnce({
        auth: { admin: { createUser: mockCreateUser, deleteUser: vi.fn() } },
      } as never)

      const result = await inviteStaffAction(validInput)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.profileId).toBe("new-user-1")
        expect(result.data.tempPassword).toHaveLength(12)
      }
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new.teacher@school.ac.th", email_confirm: true }),
      )
    })
  })

  describe("removeStaffAction", () => {
    it("fails with FORBIDDEN for director (admin only)", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "director",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await removeStaffAction({ profileId: "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with CONFLICT when removing self", async () => {
      const selfId = "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc"
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: selfId,
        schoolId: "sch-1",
        role: "admin",
        profileId: selfId,
        studentId: null,
      })

      const result = await removeStaffAction({ profileId: selfId })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("CONFLICT")
    })

    it("fails with CONFLICT when removing the last active admin", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const chain: Record<string, unknown> = {}
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.maybeSingle = vi.fn().mockResolvedValue({
        data: { id: "prof-last", role: "admin", is_active: true },
        error: null,
      })
      chain.neq = vi.fn().mockResolvedValue({ count: 0, error: null })
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(chain),
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const result = await removeStaffAction({ profileId: "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("CONFLICT")
    })

    it("deletes auth user and deactivates profile", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "profiles") {
            const chain = {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "prof-2", role: "subject_teacher", is_active: true },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
              }),
            }
            return chain
          }
          return {}
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const mockDeleteUser = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(createAdminClient).mockReturnValueOnce({
        auth: { admin: { createUser: vi.fn(), deleteUser: mockDeleteUser } },
      } as never)

      const result = await removeStaffAction({ profileId: "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc" })
      expect(result.ok).toBe(true)
      expect(mockDeleteUser).toHaveBeenCalled()
    })
  })
})
