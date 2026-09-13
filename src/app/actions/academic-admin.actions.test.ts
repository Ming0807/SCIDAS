import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  upsertAcademicYearAction,
  deleteAcademicYearAction,
  upsertSemesterAction,
  deleteSemesterAction,
  upsertClassroomAction,
  deleteClassroomAction,
} from "./academic-admin.actions"
import type { ActionResult } from "@/lib/server/action-result"

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

const validUuid = "123e4567-e89b-12d3-a456-426614174000"
const mockPrevState: ActionResult<{ id: string }> = { ok: false, code: "INTERNAL_ERROR", message: "" }

describe("academic-admin.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("assertLeadershipRole", () => {
    it("fails with UNAUTHORIZED if user is not admin or director", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("year", "2569")
      formData.set("startDate", "2026-05-16")
      formData.set("endDate", "2027-03-31")

      const result = await upsertAcademicYearAction(mockPrevState, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
        expect(result.message).toContain("เฉพาะผู้ดูแลระบบหรือผู้อำนวยการเท่านั้น")
      }
    })
  })

  describe("upsertAcademicYearAction", () => {
    it("fails with VALIDATION_ERROR if year is out of range", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("year", "2026") // min is 2500 for Buddhist era year
      formData.set("startDate", "2026-05-16")
      formData.set("endDate", "2027-03-31")

      const result = await upsertAcademicYearAction(mockPrevState, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("creates academic year successfully and revalidates paths", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "ay-1" },
            error: null,
          }),
        }),
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      })

      const formData = new FormData()
      formData.set("year", "2569")
      formData.set("startDate", "2026-05-16")
      formData.set("endDate", "2027-03-31")
      formData.set("isCurrent", "true")

      const result = await upsertAcademicYearAction(mockPrevState, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("ay-1")
      }

      expect(mockInsert).toHaveBeenCalledWith({
        school_id: "sch-1",
        year: 2569,
        start_date: "2026-05-16",
        end_date: "2027-03-31",
        is_current: true,
      })
      expect(revalidatePath).toHaveBeenCalledWith("/settings/academic")
      expect(revalidatePath).toHaveBeenCalledWith("/academics")
    })
  })

  describe("deleteAcademicYearAction", () => {
    it("deletes academic year successfully", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          delete: mockDelete,
        }),
      })

      const result = await deleteAcademicYearAction("ay-1")
      expect(result.ok).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith("/settings/academic")
    })
  })

  describe("upsertSemesterAction", () => {
    it("fails with VALIDATION_ERROR when academicYearId is not a valid uuid", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("academicYearId", "not-a-uuid")
      formData.set("semester", "semester_1")
      formData.set("startDate", "2026-05-16")
      formData.set("endDate", "2026-10-15")

      const result = await upsertSemesterAction(mockPrevState, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("inserts semester successfully", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "sem-1" },
            error: null,
          }),
        }),
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      })

      const formData = new FormData()
      formData.set("academicYearId", validUuid)
      formData.set("semester", "semester_1")
      formData.set("startDate", "2026-05-16")
      formData.set("endDate", "2026-10-15")
      formData.set("isCurrent", "true")

      const result = await upsertSemesterAction(mockPrevState, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("sem-1")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/settings/academic")
      expect(revalidatePath).toHaveBeenCalledWith("/academics")
      expect(revalidatePath).toHaveBeenCalledWith("/attendance")
    })
  })

  describe("deleteSemesterAction", () => {
    it("deletes semester and returns ok", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      })

      const result = await deleteSemesterAction("sem-1")
      expect(result.ok).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith("/settings/academic")
    })
  })

  describe("upsertClassroomAction & deleteClassroomAction", () => {
    it("creates classroom successfully", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "cls-1" },
                error: null,
              }),
            }),
          }),
        }),
      })

      const formData = new FormData()
      formData.set("academicYearId", validUuid)
      formData.set("gradeLevel", "m1")
      formData.set("section", "1")
      formData.set("name", "ม.1/1")
      formData.set("roomNumber", "101")
      formData.set("maxStudents", "35")

      const result = await upsertClassroomAction(mockPrevState, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("cls-1")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/settings/academic")
      expect(revalidatePath).toHaveBeenCalledWith("/students")
    })

    it("deletes classroom successfully", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      })

      const result = await deleteClassroomAction("cls-1")
      expect(result.ok).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith("/settings/academic")
      expect(revalidatePath).toHaveBeenCalledWith("/students")
    })
  })
})
