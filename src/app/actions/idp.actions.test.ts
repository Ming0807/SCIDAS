import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  createDevelopmentPlanAction,
  updateDevelopmentPlanAction,
} from "./idp.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

describe("idp.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createDevelopmentPlanAction", () => {
    it("fails with UNAUTHORIZED if profileId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: null,
        studentId: null,
      })

      const formData = new FormData()
      formData.set("title", "IDP Plan 1")

      const result = await createDevelopmentPlanAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
      }
    })

    it("fails with FORBIDDEN if role is not an authorized editor", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "subject_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("title", "IDP Plan 1")

      const result = await createDevelopmentPlanAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if required fields are missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("title", "")

      const result = await createDevelopmentPlanAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("fails with VALIDATION_ERROR if end_date is before start_date", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("title", "IDP Plan 1")
      formData.set("student_id", "stu-1")
      formData.set("semester_id", "sem-1")
      formData.set("start_date", "2026-10-01")
      formData.set("end_date", "2026-09-01") // earlier than start_date

      const result = await createDevelopmentPlanAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.end_date).toBeDefined()
      }
    })

    it("successfully creates a development plan and revalidates paths", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn((table: string) => {
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
        if (table === "development_plans") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "plan-101" }, error: null }),
              }),
            }),
          }
        }
        return {}
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("title", "แผนพัฒนาด้านการอ่าน")
      formData.set("student_id", "stu-1")
      formData.set("semester_id", "sem-1")
      formData.set("start_date", "2026-06-01")
      formData.set("end_date", "2026-10-31")
      formData.set("focus_areas", "การอ่าน, การสะกดคำ")

      const result = await createDevelopmentPlanAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("plan-101")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/development-plans")
      expect(revalidatePath).toHaveBeenCalledWith("/development-plans/plan-101")
    })
  })

  describe("updateDevelopmentPlanAction", () => {
    it("fails with VALIDATION_ERROR if id is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("id", "")

      const result = await updateDevelopmentPlanAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })
  })
})
