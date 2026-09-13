import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  createStudentAction,
  updateStudentAction,
} from "./student.actions"

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

describe("student.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createStudentAction", () => {
    it("fails with FORBIDDEN if role is not authorized", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "subject_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("first_name", "Somchai")

      const result = await createStudentAction(null, formData)
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
      formData.set("first_name", "")

      const result = await createStudentAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.first_name).toBeDefined()
        expect(result.fieldErrors?.last_name).toBeDefined()
        expect(result.fieldErrors?.student_code).toBeDefined()
      }
    })

    it("fails with CONFLICT if student code already exists (code 23505)", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "23505", message: "unique constraint violation" },
            }),
          }),
        }),
      })

      // @ts-expect-error mock client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("first_name", "Somchai")
      formData.set("last_name", "Jaidee")
      formData.set("student_code", "STU001")
      formData.set("gender", "male")
      formData.set("date_of_birth", "2015-05-10")

      const result = await createStudentAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("CONFLICT")
        expect(result.fieldErrors?.student_code).toBeDefined()
      }
    })

    it("successfully creates a student and revalidates /students", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "stu-100" },
              error: null,
            }),
          }),
        }),
      })

      // @ts-expect-error mock client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("first_name", "Somchai")
      formData.set("last_name", "Jaidee")
      formData.set("student_code", "STU001")
      formData.set("gender", "male")
      formData.set("date_of_birth", "2015-05-10")

      const result = await createStudentAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("stu-100")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/students")
    })
  })

  describe("updateStudentAction", () => {
    it("fails with VALIDATION_ERROR if student_id is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("student_id", "")

      const result = await updateStudentAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("successfully updates a student and revalidates paths", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "stu-100" },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      })

      // @ts-expect-error mock client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("student_id", "stu-100")
      formData.set("first_name", "Somchai")
      formData.set("last_name", "Jaidee")
      formData.set("student_code", "STU001")
      formData.set("gender", "male")
      formData.set("date_of_birth", "2015-05-10")
      formData.set("status", "active")

      const result = await updateStudentAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("stu-100")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/students")
      expect(revalidatePath).toHaveBeenCalledWith("/students/stu-100")
    })
  })
})
