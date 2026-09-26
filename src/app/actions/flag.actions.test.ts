import { describe, it, expect, vi, beforeEach } from "vitest"

import { clearTeacherFlagAction, setTeacherFlagAction } from "./flag.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext, type AppRole } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

function mockContext(role: AppRole = "homeroom_teacher", profileId: string | null = "prof-1") {
  vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
    userId: "user-1",
    schoolId: "sch-1",
    role,
    profileId,
    studentId: null,
  })
}

describe("flag.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("setTeacherFlagAction", () => {
    it("fails with FORBIDDEN for subject_teacher (outside RLS manage roles)", async () => {
      mockContext("subject_teacher")
      const result = await setTeacherFlagAction({ student_id: "stu-1", reason: "ขาดเรียนบ่อย" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with VALIDATION_ERROR when reason is empty", async () => {
      mockContext()
      const result = await setTeacherFlagAction({ student_id: "stu-1", reason: "   " })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with NOT_FOUND when student is outside the school", async () => {
      mockContext()
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

      const result = await setTeacherFlagAction({ student_id: "stu-x", reason: "พฤติกรรมน่าห่วง" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("NOT_FOUND")
    })

    it("upserts teacher_flagged and revalidates student surfaces", async () => {
      mockContext("counselor")
      const mockUpsert = vi.fn().mockResolvedValue({ error: null })
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
          if (table === "student_flags") {
            return { upsert: mockUpsert }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await setTeacherFlagAction({ student_id: "stu-1", reason: "แยกตัวจากเพื่อน" })
      expect(result.ok).toBe(true)
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          school_id: "sch-1",
          student_id: "stu-1",
          flag_key: "teacher_flagged",
          status: "active",
        }),
        { onConflict: "school_id,student_id,flag_key" },
      )
      expect(revalidatePath).toHaveBeenCalledWith("/students/stu-1")
      expect(revalidatePath).toHaveBeenCalledWith("/risk-analysis")
    })
  })

  describe("clearTeacherFlagAction", () => {
    it("fails with FORBIDDEN for student role", async () => {
      mockContext("student", null)
      const result = await clearTeacherFlagAction({ student_id: "stu-1" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("resolves the active flag", async () => {
      mockContext("admin")
      const mockEq3 = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: mockEq3,
                }),
              }),
            }),
          }),
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await clearTeacherFlagAction({ student_id: "stu-1" })
      expect(result.ok).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith("/students/stu-1")
    })
  })
})
