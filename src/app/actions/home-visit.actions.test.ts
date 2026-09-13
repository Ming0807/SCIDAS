import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  createHomeVisitAction,
  updateHomeVisitAction,
} from "./home-visit.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/lib/server/home-visit-read-models", () => ({
  createHomeVisit: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createHomeVisit } from "@/lib/server/home-visit-read-models"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

describe("home-visit.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createHomeVisitAction", () => {
    it("fails with UNAUTHORIZED if profileId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: null,
        studentId: null,
      })

      const formData = new FormData()
      formData.set("studentId", "stu-1")
      formData.set("visitDate", "2026-09-13")

      const result = await createHomeVisitAction(null, formData)
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
      formData.set("studentId", "stu-1")
      formData.set("visitDate", "2026-09-13")

      const result = await createHomeVisitAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if studentId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("visitDate", "2026-09-13")

      const result = await createHomeVisitAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.studentId).toBeDefined()
      }
    })

    it("fails with VALIDATION_ERROR if visitDate is invalid", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("studentId", "stu-1")
      formData.set("visitDate", "invalid-date")

      const result = await createHomeVisitAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.visitDate).toBeDefined()
      }
    })

    it("fails with VALIDATION_ERROR if visitTime has invalid hours or minutes", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("studentId", "stu-1")
      formData.set("visitDate", "2026-09-13")
      formData.set("visitTime", "25:70")

      const result = await createHomeVisitAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.visitTime).toBeDefined()
      }
    })

    it("successfully creates a home visit and revalidates paths", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      vi.mocked(createHomeVisit).mockResolvedValueOnce({ id: "visit-123" })

      const formData = new FormData()
      formData.set("studentId", "stu-1")
      formData.set("visitDate", "2026-09-13")
      formData.set("visitTime", "14:30")
      formData.set("housingCondition", "moderate")
      formData.set("overallAssessment", "สภาพแวดล้อมเหมาะสม")

      const result = await createHomeVisitAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("visit-123")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/home-visits")
    })
  })

  describe("updateHomeVisitAction", () => {
    it("fails with VALIDATION_ERROR when record_id is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("record_id", "")
      formData.set("studentId", "stu-1")
      formData.set("visitDate", "2026-09-13")

      const result = await updateHomeVisitAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("successfully updates home visit and revalidates paths", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const updateMock = {
        eq: vi.fn(),
        then: (resolve: (val: { error: null }) => void) => resolve({ error: null }),
      }
      updateMock.eq.mockReturnValue(updateMock)

      const mockFrom = vi.fn((table: string) => {
        if (table === "home_visits") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: "visit-123", student_id: "stu-1", visitor_id: "prof-1", semester_id: "sem-1" },
                    error: null,
                  }),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue(updateMock),
          }
        }
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
        return {}
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("record_id", "visit-123")
      formData.set("studentId", "stu-1")
      formData.set("visitDate", "2026-09-13")
      formData.set("visitTime", "15:00")
      formData.set("overallAssessment", "ติดตามผลแล้ว เรียบร้อยดี")

      const result = await updateHomeVisitAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("visit-123")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/home-visits")
      expect(revalidatePath).toHaveBeenCalledWith("/home-visits/visit-123")
    })
  })
})
