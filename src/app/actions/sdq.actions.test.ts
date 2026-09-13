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
import { saveSdqAssessmentAction } from "./sdq.actions"

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
})
