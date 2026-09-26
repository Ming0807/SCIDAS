import { describe, it, expect, vi, beforeEach } from "vitest"

import { createAssignmentAction, updateSubmissionStatusAction } from "./assignment.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext, type AppRole } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

function mockContext(role: AppRole = "homeroom_teacher", profileId: string | null = "prof-1") {
  vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
    userId: "user-1",
    schoolId: "sch-1",
    role,
    profileId,
    studentId: null,
  })
}

describe("assignment.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createAssignmentAction", () => {
    const validInput = {
      classroom_subject_id: "cs-1",
      title: "แบบฝึกหัดบทที่ 3",
      due_date: "2026-10-10",
      student_ids: ["stu-1", "stu-2"],
    }

    it("fails with UNAUTHORIZED if profileId is missing", async () => {
      mockContext("admin", null)
      const result = await createAssignmentAction(validInput)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("UNAUTHORIZED")
    })

    it("fails with FORBIDDEN for student role", async () => {
      mockContext("student", null)
      const result = await createAssignmentAction(validInput)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with VALIDATION_ERROR for empty title", async () => {
      mockContext()
      const result = await createAssignmentAction({ ...validInput, title: "  " })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with VALIDATION_ERROR for malformed due date", async () => {
      mockContext()
      const result = await createAssignmentAction({ ...validInput, due_date: "10/10/2026" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with VALIDATION_ERROR when no students selected", async () => {
      mockContext()
      const result = await createAssignmentAction({ ...validInput, student_ids: [] })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("inserts one row per student and revalidates /behavior", async () => {
      mockContext()
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "classroom_subjects") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "cs-1", teacher_id: "prof-9" },
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === "students") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  in: vi.fn().mockResolvedValue({
                    data: [{ id: "stu-1" }, { id: "stu-2" }],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "assignment_submissions") {
            return { insert: mockInsert }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await createAssignmentAction(validInput)
      expect(result.ok).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          school_id: "sch-1",
          student_id: "stu-1",
          classroom_subject_id: "cs-1",
          assignment_title: "แบบฝึกหัดบทที่ 3",
          status: "not_submitted",
          assigned_by: "prof-1",
        }),
        expect.objectContaining({ student_id: "stu-2" }),
      ])
      expect(revalidatePath).toHaveBeenCalledWith("/behavior")
    })
  })

  describe("updateSubmissionStatusAction", () => {
    it("fails with VALIDATION_ERROR for unknown status", async () => {
      mockContext()
      const result = await updateSubmissionStatusAction({
        id: "a-1",
        // @ts-expect-error invalid status on purpose
        status: "lost",
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with NOT_FOUND when the submission does not exist", async () => {
      mockContext()
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await updateSubmissionStatusAction({ id: "a-1", status: "submitted" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("NOT_FOUND")
    })

    it("updates status and revalidates /behavior", async () => {
      mockContext("admin")
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "assignment_submissions" && mockUpdateEq.mock.calls.length === 0) {
            // First call is the fetch; distinguish by select vs update below
          }
          if (table === "assignment_submissions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: {
                        id: "a-1",
                        classroom_subject_id: "cs-1",
                        classroom_subjects: { teacher_id: "prof-1" },
                      },
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
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await updateSubmissionStatusAction({
        id: "a-1",
        status: "submitted",
        submitted_date: "2026-10-09",
        score: 8,
      })
      expect(result.ok).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith("/behavior")
    })
  })
})
