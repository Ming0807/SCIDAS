import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  createSupportRecord,
  createSupportRecordFormAction,
  updateSupportRecord,
  transitionSupportRecord,
  getSupportRecords,
  getSupportRecord,
  createSupportFollowupAction,
  deleteSupportFollowupAction,
} from "./support.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
  getCurrentSemesterId: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

describe("support.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createSupportRecord", () => {
    it("fails with UNAUTHORIZED if profileId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: null,
        studentId: null,
      })

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("support_type", "academic")
      formData.set("priority", "medium")
      formData.set("title", "Math tutoring")
      formData.set("description", "Needs tutoring in algebra")

      const result = await createSupportRecord(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
      }
    })

    it("fails with FORBIDDEN if role is not a support editor (e.g. student or teacher)", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "subject_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("support_type", "academic")
      formData.set("priority", "medium")
      formData.set("title", "Math tutoring")
      formData.set("description", "Needs tutoring in algebra")

      const result = await createSupportRecord(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if required fields are missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      // missing support_type, priority, title, description

      const result = await createSupportRecord(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.support_type).toBeDefined()
        expect(result.fieldErrors?.priority).toBeDefined()
        expect(result.fieldErrors?.title).toBeDefined()
        expect(result.fieldErrors?.description).toBeDefined()
      }
    })

    it("fails with FORBIDDEN if student does not belong to user school", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "students") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const formData = new FormData()
      formData.set("student_id", "stu-other")
      formData.set("support_type", "academic")
      formData.set("priority", "medium")
      formData.set("title", "Math tutoring")
      formData.set("description", "Needs tutoring in algebra")

      const result = await createSupportRecord(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
        expect(result.fieldErrors?.student_id).toBeDefined()
      }
    })

    it("creates a support record successfully and triggers revalidations", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })
      vi.mocked(getCurrentSemesterId).mockResolvedValueOnce("sem-1")

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "supp-1" },
            error: null,
          }),
        }),
      })

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "students") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: "stu-1" }, error: null }),
                  }),
                }),
              }),
            }
          }
          if (table === "semesters") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: "sem-1" }, error: null }),
                  }),
                }),
              }),
            }
          }
          if (table === "support_records") {
            return {
              insert: mockInsert,
            }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("support_type", "emotional")
      formData.set("priority", "high")
      formData.set("title", "Anxiety support")
      formData.set("description", "Student experiencing test anxiety")
      formData.set("action_plan", "Weekly counseling sessions")

      const result = await createSupportRecordFormAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("supp-1")
        expect(result.data.status).toBe("pending")
        expect(result.redirectTo).toBe("/support/supp-1")
      }

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          student_id: "stu-1",
          semester_id: "sem-1",
          school_id: "sch-1",
          support_type: "emotional",
          priority: "high",
          title: "Anxiety support",
          description: "Student experiencing test anxiety",
          action_plan: "Weekly counseling sessions",
          provided_by: "prof-1",
          status: "pending",
        }),
      )

      expect(revalidatePath).toHaveBeenCalledWith("/support")
      expect(revalidatePath).toHaveBeenCalledWith("/support/new")
      expect(revalidatePath).toHaveBeenCalledWith("/support/supp-1")
      expect(revalidatePath).toHaveBeenCalledWith("/students/stu-1")
    })
  })

  describe("updateSupportRecord", () => {
    it("fails with VALIDATION_ERROR if id is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      const result = await updateSupportRecord(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.id).toBeDefined()
      }
    })

    it("fails with NOT_FOUND if record does not exist in the school", async () => {
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
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const formData = new FormData()
      formData.set("id", "supp-missing")

      const result = await updateSupportRecord(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("NOT_FOUND")
      }
    })

    it("fails with CONFLICT when attempting an invalid status transition (e.g. pending -> completed)", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const existingRecord = {
        id: "supp-1",
        school_id: "sch-1",
        student_id: "stu-1",
        semester_id: "sem-1",
        status: "pending",
        support_type: "academic",
        priority: "medium",
        title: "Algebra Tutoring",
        description: "Initial description",
      }

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "support_records") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: existingRecord, error: null }),
                  }),
                }),
              }),
            }
          }
          if (table === "students" || table === "semesters") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: "ok" }, error: null }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const formData = new FormData()
      formData.set("id", "supp-1")
      formData.set("status", "completed")

      const result = await updateSupportRecord(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("CONFLICT")
        expect(result.fieldErrors?.status).toBeDefined()
      }
    })

    it("updates status to in_progress and auto-sets started_at if not present", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const existingRecord = {
        id: "supp-1",
        school_id: "sch-1",
        student_id: "stu-1",
        semester_id: "sem-1",
        status: "pending",
        support_type: "academic",
        priority: "medium",
        title: "Algebra Tutoring",
        description: "Initial description",
        started_at: null,
      }

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "supp-1", status: "in_progress" },
                error: null,
              }),
            }),
          }),
        }),
      })

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "support_records") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: existingRecord, error: null }),
                  }),
                }),
              }),
              update: mockUpdate,
            }
          }
          if (table === "students" || table === "semesters") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: "ok" }, error: null }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const formData = new FormData()
      formData.set("id", "supp-1")
      formData.set("status", "in_progress")

      const result = await transitionSupportRecord(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("supp-1")
        expect(result.data.status).toBe("in_progress")
      }

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "in_progress",
          started_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        }),
      )
      expect(revalidatePath).toHaveBeenCalledWith("/support")
      expect(revalidatePath).toHaveBeenCalledWith("/support/supp-1")
    })
  })

  describe("getSupportRecords", () => {
    it("fails with FORBIDDEN if user role is student", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: "prof-1",
        studentId: "stu-1",
      })

      const result = await getSupportRecords()
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("returns mapped support records successfully", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const mockRows = [
        {
          id: "supp-1",
          school_id: "sch-1",
          student_id: "stu-1",
          semester_id: "sem-1",
          support_type: "academic",
          title: "Math Tutoring",
          description: "Needs help",
          action_plan: null,
          provided_support: null,
          resources_used: null,
          external_referral: null,
          status: "pending",
          priority: "high",
          started_at: null,
          completed_at: null,
          provided_by: "prof-1",
          approved_by: null,
          created_at: "2026-03-01T00:00:00Z",
          updated_at: "2026-03-01T00:00:00Z",
          students: { id: "stu-1", first_name: "John", last_name: "Doe", student_code: "S101" },
          profiles: { id: "prof-1", first_name: "Teacher", last_name: "One" },
        },
      ]

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
            }),
          }),
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await getSupportRecords()
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].id).toBe("supp-1")
        expect(result.data[0].student?.first_name).toBe("John")
        expect(result.data[0].provider?.first_name).toBe("Teacher")
      }
    })
  })

  describe("getSupportRecord", () => {
    it("fails with NOT_FOUND if record is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

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

      const result = await getSupportRecord("supp-none")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("NOT_FOUND")
      }
    })

    it("returns the support record with canEdit true for counselor", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const mockRow = {
        id: "supp-1",
        school_id: "sch-1",
        student_id: "stu-1",
        semester_id: "sem-1",
        support_type: "academic",
        title: "Math Tutoring",
        description: "Needs help",
        action_plan: null,
        provided_support: null,
        resources_used: null,
        external_referral: null,
        status: "pending",
        priority: "high",
        started_at: null,
        completed_at: null,
        provided_by: "prof-1",
        approved_by: null,
        created_at: "2026-03-01T00:00:00Z",
        updated_at: "2026-03-01T00:00:00Z",
        students: { id: "stu-1", first_name: "John", last_name: "Doe", student_code: "S101" },
        profiles: { id: "prof-1", first_name: "Teacher", last_name: "One" },
      }

      const mockClient = {
        from: vi.fn((table: string) => {
          if (table === "support_records") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: mockRow, error: null }),
                  }),
                }),
              }),
            }
          }
          if (table === "support_followups") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(
        mockClient as unknown as Awaited<ReturnType<typeof createClient>>,
      )

      const result = await getSupportRecord("supp-1")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("supp-1")
        expect(result.data.canEdit).toBe(true)
        expect(result.data.student?.first_name).toBe("John")
        expect(Array.isArray(result.data.followups)).toBe(true)
      }
    })
  })

  describe("createSupportFollowupAction", () => {
    it("creates a support followup successfully and triggers revalidations", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "followup-123" }, error: null }),
        }),
      })

      const mockClient = {
        from: vi.fn((table: string) => {
          if (table === "support_records") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "case-1", student_id: "stu-1" },
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === "support_followups") {
            return { insert: mockInsert }
          }
          return {}
        }),
      }

      vi.mocked(createClient).mockResolvedValueOnce(
        mockClient as unknown as Awaited<ReturnType<typeof createClient>>,
      )

      const formData = new FormData()
      formData.set("support_record_id", "case-1")
      formData.set("followup_date", "2026-09-15")
      formData.set("description", "Student shows positive adaptation in class")
      formData.set("result", "ดีขึ้น")
      formData.set("improvement_noted", "true")

      const result = await createSupportFollowupAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("followup-123")
      }
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          support_record_id: "case-1",
          school_id: "sch-1",
          followed_by: "prof-1",
          followup_date: "2026-09-15",
          improvement_noted: true,
        }),
      )
    })

    it("fails with VALIDATION_ERROR if description is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("support_record_id", "case-1")
      formData.set("description", "")

      const result = await createSupportFollowupAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.description).toBeDefined()
      }
    })
  })

  describe("deleteSupportFollowupAction", () => {
    it("deletes a support followup successfully and revalidates route", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-admin",
        studentId: null,
      })

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({ delete: mockDelete }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await deleteSupportFollowupAction("followup-1", "case-1")
      expect(result.ok).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith("/support/case-1")
    })
  })
})
