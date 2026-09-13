import { describe, it, expect, vi, beforeEach } from "vitest"

import { upsertAcademicScores } from "./academic.actions"

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

describe("academic.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("upsertAcademicScores", () => {
    it("fails with UNAUTHORIZED if profileId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: null,
        studentId: null,
      })

      const result = await upsertAcademicScores("sem-1", [
        {
          student_id: "stu-1",
          classroom_subject_id: "cs-1",
          classwork_score: 30,
          midterm_score: 30,
          final_score: 30,
        },
      ])

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
      }
    })

    it("fails with FORBIDDEN if user role is student", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: "prof-1",
        studentId: "stu-1",
      })

      const result = await upsertAcademicScores("sem-1", [
        {
          student_id: "stu-1",
          classroom_subject_id: "cs-1",
          classwork_score: 30,
          midterm_score: 30,
          final_score: 30,
        },
      ])

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if records array is empty", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await upsertAcademicScores("sem-1", [])
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("fails with VALIDATION_ERROR if total score exceeds 100", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await upsertAcademicScores("sem-1", [
        {
          student_id: "stu-1",
          classroom_subject_id: "cs-1",
          classwork_score: 50,
          midterm_score: 30,
          final_score: 30, // Total = 110 > 100
        },
      ])

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
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
          if (table === "classroom_subjects") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({
                      data: [{ id: "cs-1", classroom_id: "c-1", semester_id: "sem-1", teacher_id: "prof-1" }],
                      error: null,
                    }),
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

      const result = await upsertAcademicScores("sem-1", [
        {
          student_id: "stu-1",
          classroom_subject_id: "cs-1",
          classwork_score: 30,
          midterm_score: 30,
          final_score: 20,
        },
      ])

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("NOT_FOUND")
      }
    })

    it("upserts scores with correct calculated grade and revalidates /academics", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
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
          if (table === "classroom_subjects") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({
                      data: [{ id: "cs-1", classroom_id: "c-1", semester_id: "sem-1", teacher_id: "prof-1" }],
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === "classroom_students") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      in: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                          data: [{ student_id: "stu-1", classroom_id: "c-1" }],
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === "academic_scores") {
            return {
              upsert: mockUpsert,
            }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await upsertAcademicScores("sem-1", [
        {
          student_id: "stu-1",
          classroom_subject_id: "cs-1",
          classwork_score: 40,
          midterm_score: 25,
          final_score: 20, // Total = 85 -> Grade 4, GradePoint 4
          remark: "Great effort",
        },
      ])

      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.count).toBe(1)
      }

      expect(mockUpsert).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            school_id: "sch-1",
            student_id: "stu-1",
            classroom_subject_id: "cs-1",
            semester_id: "sem-1",
            classwork_score: 40,
            midterm_score: 25,
            final_score: 20,
            grade: "4",
            grade_point: 4,
            remark: "Great effort",
          }),
        ],
        { onConflict: "student_id,classroom_subject_id,semester_id" },
      )

      expect(revalidatePath).toHaveBeenCalledWith("/academics")
    })
  })
})
