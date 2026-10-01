import { describe, it, expect, vi, beforeEach } from "vitest"

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
import { deleteSdqAssessmentAction, saveSdqAssessmentAction } from "./sdq.actions"

describe("sdq.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fails with FORBIDDEN if user is student", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "user-stu",
      schoolId: "sch-1",
      role: "student",
      profileId: "prof-1",
      studentId: "stu-1",
    })

    const formData = new FormData()
    formData.set("student_id", "stu-1")

    const result = await saveSdqAssessmentAction(null, formData)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe("FORBIDDEN")
    }
  })

  it("fails with VALIDATION_ERROR if questions are incomplete", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "user-1",
      schoolId: "sch-1",
      role: "homeroom_teacher",
      profileId: "prof-teacher",
      studentId: null,
    })

    const formData = new FormData()
    formData.set("student_id", "stu-1")
    formData.set("q_1", "0")
    // Missing q_2 to q_25

    const result = await saveSdqAssessmentAction(null, formData)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe("VALIDATION_ERROR")
      expect(result.message).toContain("ข้อที่ 2")
    }
  })

  it("successfully scores and saves complete SDQ assessment", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "user-1",
      schoolId: "sch-1",
      role: "counselor",
      profileId: "prof-counselor",
      studentId: null,
    })
    vi.mocked(getCurrentSemesterId).mockResolvedValueOnce("sem-1")

    const mockInsertAssessment = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: "assess-1" }, error: null }),
      }),
    })

    const mockInsertFlag = vi.fn().mockResolvedValue({ error: null })

    const mockClient = {
      from: vi.fn((table: string) => {
        if (table === "risk_assessments") {
          return { insert: mockInsertAssessment }
        }
        if (table === "student_flags") {
          return { insert: mockInsertFlag }
        }
        return {}
      }),
    }

    vi.mocked(createClient).mockResolvedValueOnce(
      mockClient as unknown as Awaited<ReturnType<typeof createClient>>,
    )

    const formData = new FormData()
    formData.set("student_id", "stu-1")
    formData.set("evaluator_type", "teacher")

    // Fill all 25 questions with 0
    for (let i = 1; i <= 25; i++) {
      formData.set(`q_${i}`, "0")
    }

    const result = await saveSdqAssessmentAction(null, formData)
    expect(result.ok).toBe(true)
    if (result.ok && result.data) {
      expect(result.data.assessmentId).toBe("assess-1")
      expect(result.data.classification).toBe("normal")
    }

    expect(mockInsertAssessment).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith("/screening/sdq")
  })

  it("upserts an active SDQ flag for concerning results", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "user-1",
      schoolId: "sch-1",
      role: "homeroom_teacher",
      profileId: "prof-1",
      studentId: null,
    })
    vi.mocked(getCurrentSemesterId).mockResolvedValueOnce("sem-1")

    const mockUpsertFlag = vi.fn().mockResolvedValue({ error: null })
    const mockClient = {
      from: vi.fn((table: string) => {
        if (table === "risk_assessments") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "assess-2" }, error: null }),
              }),
            }),
          }
        }
        if (table === "student_flags") {
          return { upsert: mockUpsertFlag }
        }
        return {}
      }),
    }
    vi.mocked(createClient).mockResolvedValueOnce(
      mockClient as unknown as Awaited<ReturnType<typeof createClient>>,
    )

    const formData = new FormData()
    formData.set("student_id", "stu-1")
    formData.set("evaluator_type", "teacher")
    // Max difficulty answers to force a non-normal classification.
    for (let i = 1; i <= 25; i++) {
      formData.set(`q_${i}`, "2")
    }

    const result = await saveSdqAssessmentAction(null, formData)
    expect(result.ok).toBe(true)
    expect(mockUpsertFlag).toHaveBeenCalledWith(
      expect.objectContaining({ flag_key: expect.stringMatching(/^sdq_/), status: "active" }),
      { onConflict: "school_id,student_id,flag_key" },
    )
  })

  describe("deleteSdqAssessmentAction", () => {
    it("fails with FORBIDDEN for student role", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: null,
        studentId: "stu-1",
      })

      const result = await deleteSdqAssessmentAction("assess-1")
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with NOT_FOUND for assessments outside the school", async () => {
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
      vi.mocked(createClient).mockResolvedValueOnce(
        mockClient as unknown as Awaited<ReturnType<typeof createClient>>,
      )

      const result = await deleteSdqAssessmentAction("assess-x")
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("NOT_FOUND")
    })

    it("deletes the assessment and resolves SDQ flags when nothing concerning remains", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
      const mockFlagUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "risk_assessments") {
            const chain: Record<string, unknown> = {}
            chain.select = vi.fn().mockReturnValue(chain)
            chain.eq = vi.fn().mockReturnValue(chain)
            chain.ilike = vi.fn().mockReturnValue(chain)
            chain.neq = vi.fn().mockReturnValue(chain)
            chain.limit = vi.fn().mockImplementation(() =>
              Promise.resolve({ data: [], error: null }),
            )
            chain.maybeSingle = vi.fn().mockResolvedValue({
              data: { id: "assess-1", student_id: "stu-1", semester_id: "sem-1" },
              error: null,
            })
            chain.delete = vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({ eq: mockDeleteEq }),
            })
            return chain
          }
          if (table === "student_flags") {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    in: vi.fn().mockReturnValue({
                      eq: mockFlagUpdateEq,
                    }),
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

      const result = await deleteSdqAssessmentAction("assess-1")
      expect(result.ok).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith("/screening/sdq/stu-1")
    })

    it("rejects deletion with FORBIDDEN if user is non-author subject teacher", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-2",
        schoolId: "sch-1",
        role: "subject_teacher",
        profileId: "prof-other",
        studentId: null,
      })

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "risk_assessments") {
            const chain: Record<string, unknown> = {}
            chain.select = vi.fn().mockReturnValue(chain)
            chain.eq = vi.fn().mockReturnValue(chain)
            chain.maybeSingle = vi.fn().mockResolvedValue({
              data: {
                id: "assess-1",
                student_id: "stu-1",
                semester_id: "sem-1",
                assessed_by: "prof-original",
              },
              error: null,
            })
            return chain
          }
          return {}
        }),
      }
      vi.mocked(createClient).mockResolvedValueOnce(
        mockClient as unknown as Awaited<ReturnType<typeof createClient>>,
      )

      const result = await deleteSdqAssessmentAction("assess-1")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
        expect(result.message).toContain("คุณสามารถลบได้เฉพาะผลการประเมินที่คุณเป็นผู้บันทึก")
      }
    })
  })
})
