import { describe, it, expect, vi, beforeEach } from "vitest"

import { upsertAttendance, type AttendanceInput } from "./attendance.actions"

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

describe("attendance.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("upsertAttendance", () => {
    it("fails with UNAUTHORIZED if profileId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: null,
        studentId: null,
      })

      const records: AttendanceInput[] = [{ student_id: "stu-1", status: "present" }]
      const result = await upsertAttendance("class-1", "2026-09-13", records)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
      }
    })

    it("fails with FORBIDDEN if role is not authorized", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "subject_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const records: AttendanceInput[] = [{ student_id: "stu-1", status: "present" }]
      const result = await upsertAttendance("class-1", "2026-09-13", records)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if date is not ISO YYYY-MM-DD", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const records: AttendanceInput[] = [{ student_id: "stu-1", status: "present" }]
      const result = await upsertAttendance("class-1", "13/09/2026", records)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("ห้องเรียนหรือวันที่ไม่ถูกต้อง")
      }
    })

    it("fails with VALIDATION_ERROR if records is empty", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await upsertAttendance("class-1", "2026-09-13", [])
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("ไม่มีข้อมูลการมาเรียน")
      }
    })

    it("fails with VALIDATION_ERROR if status is invalid", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      // @ts-expect-error invalid status test
      const records: AttendanceInput[] = [{ student_id: "stu-1", status: "unknown_status" }]
      const result = await upsertAttendance("class-1", "2026-09-13", records)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("fails with VALIDATION_ERROR if duplicate students exist in payload", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const records: AttendanceInput[] = [
        { student_id: "stu-1", status: "present" },
        { student_id: "stu-1", status: "late" },
      ]
      const result = await upsertAttendance("class-1", "2026-09-13", records)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("พบนักเรียนซ้ำ")
      }
    })

    it("fails with NOT_FOUND if classroom does not exist", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const records: AttendanceInput[] = [{ student_id: "stu-1", status: "present" }]
      const result = await upsertAttendance("class-nonexistent", "2026-09-13", records)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("NOT_FOUND")
      }
    })

    it("fails with FORBIDDEN if students are not enrolled in the classroom", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn((table: string) => {
        if (table === "classrooms") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "class-1", homeroom_teacher_id: "prof-1" },
                      error: null,
                    }),
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
                    in: vi.fn().mockResolvedValue({ data: [], error: null }), // 0 enrolled
                  }),
                }),
              }),
            }),
          }
        }
        return {}
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const records: AttendanceInput[] = [{ student_id: "stu-not-enrolled", status: "present" }]
      const result = await upsertAttendance("class-1", "2026-09-13", records)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
        expect(result.message).toContain("ไม่ได้อยู่ในห้องเรียนนี้")
      }
    })

    it("successfully upserts attendance and revalidates /attendance", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockFrom = vi.fn((table: string) => {
        if (table === "classrooms") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "class-1", homeroom_teacher_id: "prof-1" },
                      error: null,
                    }),
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
                    in: vi.fn().mockResolvedValue({
                      data: [{ student_id: "stu-1" }, { student_id: "stu-2" }],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        if (table === "attendance_records") {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const records: AttendanceInput[] = [
        { student_id: "stu-1", status: "present", check_in_time: "07:45" },
        { student_id: "stu-2", status: "late", check_in_time: "08:15", remark: "รถติด" },
      ]

      const result = await upsertAttendance("class-1", "2026-09-13", records)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.count).toBe(2)
      }
      expect(revalidatePath).toHaveBeenCalledWith("/attendance")
    })
  })
})
