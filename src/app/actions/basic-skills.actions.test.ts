import { describe, it, expect, vi, beforeEach } from "vitest"

import { upsertBasicSkills } from "./basic-skills.actions"

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

const validRecord = {
  student_id: "stu-1",
  reading_level: "good" as const,
  writing_level: "fair" as const,
  math_level: "excellent" as const,
}

describe("basic-skills.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("upsertBasicSkills", () => {
    it("fails with UNAUTHORIZED if profileId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: null,
        studentId: null,
      })

      const result = await upsertBasicSkills("sem-1", [validRecord])
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("UNAUTHORIZED")
    })

    it("fails with FORBIDDEN for student role", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: null,
        studentId: "stu-1",
      })

      const result = await upsertBasicSkills("sem-1", [validRecord])
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with VALIDATION_ERROR if records array is empty", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await upsertBasicSkills("sem-1", [])
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with VALIDATION_ERROR for invalid skill level", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await upsertBasicSkills("sem-1", [
        { ...validRecord, reading_level: "superb" as never },
      ])
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with VALIDATION_ERROR for out-of-range score", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await upsertBasicSkills("sem-1", [
        { ...validRecord, reading_score: 150 },
      ])
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with NOT_FOUND if semester does not belong to school", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "semesters") {
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
          if (table === "students") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  in: vi.fn().mockResolvedValue({ data: [{ id: "stu-1" }], error: null }),
                }),
              }),
            }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await upsertBasicSkills("sem-1", [validRecord])
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("NOT_FOUND")
    })

    it("upserts skills and revalidates /academics", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockUpsert = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
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
          if (table === "students") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  in: vi.fn().mockResolvedValue({ data: [{ id: "stu-1" }], error: null }),
                }),
              }),
            }
          }
          if (table === "basic_skills") {
            return { upsert: mockUpsert }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await upsertBasicSkills("sem-1", [
        { ...validRecord, reading_score: 82, remark: "อ่านคล่องขึ้น" },
      ])

      expect(result.ok).toBe(true)
      expect(mockUpsert).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            school_id: "sch-1",
            student_id: "stu-1",
            semester_id: "sem-1",
            reading_level: "good",
            reading_score: 82,
            assessed_by: "prof-1",
            remark: "อ่านคล่องขึ้น",
          }),
        ],
        { onConflict: "student_id,semester_id" },
      )
      expect(revalidatePath).toHaveBeenCalledWith("/academics")
    })
  })
})
