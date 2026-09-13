import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  createBehaviorRecordAction,
  updateBehaviorRecordAction,
} from "./behavior.actions"

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

describe("behavior.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createBehaviorRecordAction", () => {
    it("fails with UNAUTHORIZED if profileId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: null,
        studentId: null,
      })

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("behavior_type", "positive")
      formData.set("description", "Helped a classmate")

      const result = await createBehaviorRecordAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
      }
    })

    it("fails with FORBIDDEN if role is student", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: "prof-1",
        studentId: "stu-1",
      })

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("behavior_type", "positive")
      formData.set("description", "Helped a classmate")

      const result = await createBehaviorRecordAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if student_id is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("behavior_type", "positive")
      formData.set("description", "Helped a classmate")

      const result = await createBehaviorRecordAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.student_id).toBeDefined()
      }
    })

    it("fails with VALIDATION_ERROR if description is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("behavior_type", "positive")
      formData.set("description", "")

      const result = await createBehaviorRecordAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.description).toBeDefined()
      }
    })

    it("fails with FORBIDDEN if student belongs to another school", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("student_id", "stu-from-other-school")
      formData.set("behavior_type", "positive")
      formData.set("description", "Helped a classmate")
      formData.set("points", "5")
      formData.set("date", "2026-09-13")

      const result = await createBehaviorRecordAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("successfully creates a behavior record and revalidates paths", async () => {
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
        if (table === "behavior_records") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "beh-101" }, error: null }),
              }),
            }),
          }
        }
        return {}
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("behavior_type", "positive")
      formData.set("category", "จิตอาสา")
      formData.set("description", "ช่วยคุณครูจัดกิจกรรม")
      formData.set("points", "10")
      formData.set("date", "2026-09-13")

      const result = await createBehaviorRecordAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("beh-101")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/behavior")
      expect(revalidatePath).toHaveBeenCalledWith("/behavior/record")
      expect(revalidatePath).toHaveBeenCalledWith("/behavior/beh-101")
    })
  })

  describe("updateBehaviorRecordAction", () => {
    it("fails with VALIDATION_ERROR if record_id is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("record_id", "")
      formData.set("student_id", "stu-1")
      formData.set("behavior_type", "positive")
      formData.set("description", "Updated description")
      formData.set("date", "2026-09-13")

      const result = await updateBehaviorRecordAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("ไม่พบรหัสบันทึกพฤติกรรม")
      }
    })

    it("successfully updates record and revalidates /behavior", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn((table: string) => {
        if (table === "behavior_records") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: "beh-101", reported_by: "prof-1" },
                    error: null,
                  }),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
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
        return {}
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("record_id", "beh-101")
      formData.set("student_id", "stu-1")
      formData.set("behavior_type", "positive")
      formData.set("description", "Updated description")
      formData.set("points", "15")
      formData.set("date", "2026-09-13")

      const result = await updateBehaviorRecordAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("beh-101")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/behavior")
      expect(revalidatePath).toHaveBeenCalledWith("/behavior/beh-101")
    })
  })
})
