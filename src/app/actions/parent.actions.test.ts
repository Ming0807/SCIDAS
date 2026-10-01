import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("@/lib/server/admin-client", () => ({
  createAdminClient: vi.fn(),
}))

vi.mock("@/lib/server/audit-logger", () => ({
  logAudit: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { getCurrentUserContext, type AppRole } from "@/lib/server/current-user"
import { createAdminClient } from "@/lib/server/admin-client"
import { createClient } from "@/utils/supabase/server"

import {
  inviteParentAction,
  removeParentAccessAction,
  acknowledgeParentConsentAction,
} from "./parent.actions"

function mockContext(role: AppRole = "homeroom_teacher", profileId: string | null = "prof-1") {
  vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
    userId: "user-1",
    schoolId: "sch-1",
    role,
    profileId,
    studentId: null,
  })
}

describe("parent.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("inviteParentAction", () => {
    const validInput = {
      guardianId: "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc",
      email: "parent@school.ac.th",
      firstName: "สมศรี",
      lastName: "ใจดี",
    }

    it("fails with FORBIDDEN for subject_teacher", async () => {
      mockContext("subject_teacher")

      const result = await inviteParentAction(validInput)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with VALIDATION_ERROR for malformed email", async () => {
      mockContext()

      const result = await inviteParentAction({ ...validInput, email: "not-an-email" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with CONFLICT when guardian already linked", async () => {
      mockContext()
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "g-1", first_name: "A", last_name: "B", user_id: "u-9" },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const result = await inviteParentAction(validInput)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("CONFLICT")
    })

    it("creates auth user, parent profile, and guardian link", async () => {
      mockContext("counselor")
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "guardians") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "g-1", first_name: "A", last_name: "B", user_id: null },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
              }),
            }
          }
          if (table === "profiles") {
            return { insert: mockInsert }
          }
          return {}
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const mockCreateUser = vi.fn().mockResolvedValue({
        data: { user: { id: "new-parent-1" } },
        error: null,
      })
      vi.mocked(createAdminClient).mockReturnValueOnce({
        auth: { admin: { createUser: mockCreateUser, deleteUser: vi.fn() } },
      } as never)

      const result = await inviteParentAction(validInput)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.tempPassword).toHaveLength(12)
      }
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: "new-parent-1", role: "parent" }),
      )
    })
  })

  describe("removeParentAccessAction", () => {
    it("fails with FORBIDDEN for student role", async () => {
      mockContext("student", "prof-student")

      const result = await removeParentAccessAction({
        guardianId: "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc",
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with CONFLICT when guardian has no linked account", async () => {
      mockContext("admin")
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "g-1", user_id: null },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const result = await removeParentAccessAction({
        guardianId: "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc",
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("CONFLICT")
    })

    it("deletes auth user and unlinks guardian", async () => {
      mockContext("admin")
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "guardians") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "g-1", user_id: "u-2" },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
              }),
            }
          }
          if (table === "profiles") {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          return {}
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const mockDeleteUser = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(createAdminClient).mockReturnValueOnce({
        auth: { admin: { createUser: vi.fn(), deleteUser: mockDeleteUser } },
      } as never)

      const result = await removeParentAccessAction({
        guardianId: "c3d6c7b0-8c2d-4b8c-8f9d-123456789abc",
      })
      expect(result.ok).toBe(true)
      expect(mockDeleteUser).toHaveBeenCalledWith("u-2")
    })
  })

  describe("acknowledgeParentConsentAction", () => {
    const validConsentInput = {
      studentId: "11111111-1111-4111-a111-111111111111",
      targetType: "support" as const,
      targetId: "22222222-2222-4222-a222-222222222222",
      notes: "ยินยอมให้คุณครูช่วยดูแลเป็นพิเศษ",
    }

    it("fails with UNAUTHORIZED if not logged in", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: null as any,
        schoolId: null as any,
        role: null as any,
        profileId: null,
        studentId: null,
      })

      const result = await acknowledgeParentConsentAction(validConsentInput)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("UNAUTHORIZED")
    })

    it("fails with VALIDATION_ERROR for invalid uuid", async () => {
      mockContext("parent")

      const result = await acknowledgeParentConsentAction({
        ...validConsentInput,
        studentId: "invalid-uuid",
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("records consent action_item and updates pending support record", async () => {
      mockContext("parent", "prof-parent-1")

      const mockInsertAction = vi.fn().mockResolvedValue({ error: null })
      const mockUpdateSupport = vi.fn().mockResolvedValue({ error: null })
      const mockInsertFollowup = vi.fn().mockResolvedValue({ error: null })

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "guardians") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [{ id: "guardian-1" }],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "student_guardians") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({
                      data: [{ student_id: validConsentInput.studentId }],
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === "action_items") {
            return {
              insert: mockInsertAction,
            }
          }
          if (table === "support_records") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { status: "pending" },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: mockUpdateSupport,
                }),
              }),
            }
          }
          if (table === "support_followups") {
            return {
              insert: mockInsertFollowup,
            }
          }
          return {}
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(mockClient as never)

      const result = await acknowledgeParentConsentAction(validConsentInput)
      expect(result.ok).toBe(true)
      expect(mockInsertAction).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "parent_consent",
          student_id: validConsentInput.studentId,
          source_id: validConsentInput.targetId,
          status: "completed",
        }),
      )
      expect(mockUpdateSupport).toHaveBeenCalled()
      expect(mockInsertFollowup).toHaveBeenCalled()
    })
  })
})
