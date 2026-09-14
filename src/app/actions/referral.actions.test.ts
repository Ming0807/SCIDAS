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
import {
  getReferralsList,
  getReferralDetail,
  createReferralAction,
  updateReferralStatusAction,
} from "./referral.actions"

describe("referral.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getReferralsList", () => {
    it("fetches and categorizes internal and external referrals", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const mockRows = [
        {
          id: "ref-1",
          student_id: "stu-1",
          support_type: "health",
          title: "ส่งต่อตรวจสายตา",
          description: "นักเรียนมองกระดานไม่ชัดเจน",
          external_referral: "[ส่งต่อภายนอก] โรงพยาบาลศูนย์สุขภาพตำบล",
          status: "referred",
          priority: "medium",
          created_at: "2026-09-01T08:00:00Z",
          updated_at: "2026-09-01T08:00:00Z",
          student: {
            id: "stu-1",
            first_name: "สมชาย",
            last_name: "ใจดี",
            student_code: "10001",
            classroom: { name: "ม.1/1", grade_level: 1, section: 1 },
          },
          provider: {
            id: "prof-1",
            first_name: "ครูวิชัย",
            last_name: "ใจบุญ",
          },
        },
        {
          id: "ref-2",
          student_id: "stu-2",
          support_type: "emotional",
          title: "ส่งต่องานแนะแนวเรื่องความเครียด",
          description: "นักเรียนเครียดกับการสอบ",
          external_referral: "[ส่งต่อภายใน] ห้องแนะแนว",
          status: "in_progress",
          priority: "high",
          created_at: "2026-09-02T08:00:00Z",
          updated_at: "2026-09-02T08:00:00Z",
          student: {
            id: "stu-2",
            first_name: "สมหญิง",
            last_name: "รักเรียน",
            student_code: "10002",
            classroom: { name: "ม.2/1", grade_level: 2, section: 1 },
          },
          provider: {
            id: "prof-1",
            first_name: "ครูวิชัย",
            last_name: "ใจบุญ",
          },
        },
      ]

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
      }

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(mockQuery),
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await getReferralsList()
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].referral_type).toBe("external")
        expect(result.data[0].target_agency).toBe("โรงพยาบาลศูนย์สุขภาพตำบล")
        expect(result.data[1].referral_type).toBe("internal")
        expect(result.data[1].target_agency).toBe("ห้องแนะแนว")
      }
    })

    it("filters referrals by studentId", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const mockRows = [
        {
          id: "ref-1",
          student_id: "stu-1",
          support_type: "health",
          title: "ส่งต่อตรวจสายตา",
          description: "นักเรียนมองกระดานไม่ชัดเจน",
          external_referral: "[ส่งต่อภายนอก] โรงพยาบาลศูนย์สุขภาพตำบล",
          status: "referred",
          priority: "medium",
          created_at: "2026-09-01T08:00:00Z",
          updated_at: "2026-09-01T08:00:00Z",
          student: {
            id: "stu-1",
            first_name: "สมชาย",
            last_name: "ใจดี",
            student_code: "10001",
            classroom: { name: "ม.1/1", grade_level: 1, section: 1 },
          },
          provider: { id: "prof-1", first_name: "ครูวิชัย", last_name: "ใจบุญ" },
        },
        {
          id: "ref-2",
          student_id: "stu-2",
          support_type: "emotional",
          title: "ส่งต่องานแนะแนวเรื่องความเครียด",
          description: "นักเรียนเครียดกับการสอบ",
          external_referral: "[ส่งต่อภายใน] ห้องแนะแนว",
          status: "in_progress",
          priority: "high",
          created_at: "2026-09-02T08:00:00Z",
          updated_at: "2026-09-02T08:00:00Z",
          student: {
            id: "stu-2",
            first_name: "สมหญิง",
            last_name: "รักเรียน",
            student_code: "10002",
            classroom: { name: "ม.2/1", grade_level: 2, section: 1 },
          },
          provider: { id: "prof-1", first_name: "ครูวิชัย", last_name: "ใจบุญ" },
        },
      ]

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
      }

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(mockQuery),
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await getReferralsList({ studentId: "stu-1" })
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].student_id).toBe("stu-1")
      }
    })
  })

  describe("getReferralDetail", () => {
    it("fetches referral details and followups", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-1",
        studentId: null,
      })

      const mockRecord = {
        id: "ref-1",
        school_id: "sch-1",
        student_id: "stu-1",
        semester_id: "sem-1",
        support_type: "health",
        title: "ส่งต่อตรวจสายตา",
        description: "นักเรียนมองกระดานไม่ชัดเจน",
        action_plan: "ตัดแว่นสายตา",
        provided_support: "ทดสอบการมองเห็น",
        resources_used: null,
        external_referral: "[ส่งต่อภายนอก] โรงพยาบาลศูนย์สุขภาพตำบล",
        status: "referred",
        priority: "medium",
        started_at: "2026-09-01T08:00:00Z",
        completed_at: null,
        provided_by: "prof-1",
        created_at: "2026-09-01T08:00:00Z",
        updated_at: "2026-09-01T08:00:00Z",
        student: {
          id: "stu-1",
          first_name: "สมชาย",
          last_name: "ใจดี",
          student_code: "10001",
          gender: "male",
          date_of_birth: "2010-01-01",
          national_id: "1234567890123",
          classroom: { grade_level: 1, section: 1, name: "ม.1/1" },
        },
        provider: {
          id: "prof-1",
          first_name: "ครูวิชัย",
          last_name: "ใจบุญ",
        },
      }

      const mockFollowups = [
        {
          id: "fol-1",
          followup_date: "2026-09-05",
          result: "นัดตรวจ",
          description: "ผู้ปกครองพาไปพบแพทย์แล้ว",
          next_action: "รอรับแว่น",
          next_followup_date: "2026-09-12",
          follower: { first_name: "ครูวิชัย", last_name: "ใจบุญ" },
        },
      ]

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn((table: string) => {
          if (table === "support_records") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: mockRecord, error: null }),
                  }),
                }),
              }),
            }
          }
          if (table === "support_followups") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: mockFollowups, error: null }),
                }),
              }),
            }
          }
          return {}
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await getReferralDetail("ref-1")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.title).toBe("ส่งต่อตรวจสายตา")
        expect(result.data.referral_type).toBe("external")
        expect(result.data.followups).toHaveLength(1)
        expect(result.data.canEdit).toBe(true)
      }
    })
  })

  describe("createReferralAction", () => {
    it("fails with FORBIDDEN if user role is not allowed", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-stu",
        schoolId: "sch-1",
        role: "student",
        profileId: "prof-stu",
        studentId: "stu-1",
      })

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("target_agency", "โรงพยาบาล")
      formData.set("title", "ส่งต่อ")
      formData.set("reason", "เหตุผล")

      const result = await createReferralAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("successfully creates a referral record", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-teacher",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-teacher",
        studentId: null,
      })

      vi.mocked(getCurrentSemesterId).mockResolvedValueOnce("sem-1")

      const mockStudentSelect = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: "stu-1" }, error: null }),
      }

      const mockInsertSingle = {
        single: vi.fn().mockResolvedValue({ data: { id: "new-ref-id" }, error: null }),
      }
      const mockInsertSelect = {
        select: vi.fn().mockReturnValue(mockInsertSingle),
      }
      const mockInsert = vi.fn().mockReturnValue(mockInsertSelect)

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn((table: string) => {
          if (table === "students") {
            return {
              select: vi.fn().mockReturnValue(mockStudentSelect),
            }
          }
          if (table === "support_records") {
            return {
              insert: mockInsert,
            }
          }
          return {}
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const formData = new FormData()
      formData.set("student_id", "stu-1")
      formData.set("referral_type", "external")
      formData.set("target_agency", "โรงพยาบาลประจำอำเภอ")
      formData.set("support_type", "health")
      formData.set("title", "ส่งต่อตรวจวินิจฉัยภาวะสมาธิสั้น")
      formData.set("reason", "ผลแบบคัดกรอง SDQ ด้านสมาธิสั้นอยู่ในเกณฑ์มีปัญหาต่อเนื่อง")
      formData.set("priority", "high")

      const result = await createReferralAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("new-ref-id")
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            student_id: "stu-1",
            school_id: "sch-1",
            semester_id: "sem-1",
            status: "referred",
            external_referral: "[ส่งต่อภายนอก] โรงพยาบาลประจำอำเภอ",
            priority: "high",
          }),
        )
      }
    })
  })

  describe("updateReferralStatusAction", () => {
    it("updates status and creates followup note", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-counselor",
        schoolId: "sch-1",
        role: "counselor",
        profileId: "prof-counselor",
        studentId: null,
      })

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
      })
      const mockFollowupInsert = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn((table: string) => {
          if (table === "support_records") {
            return { update: mockUpdate }
          }
          if (table === "support_followups") {
            return { insert: mockFollowupInsert }
          }
          return {}
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await updateReferralStatusAction(
        "ref-123",
        "completed",
        "โรงพยาบาลตอบรับและนัดตรวจเรียบร้อย",
      )

      expect(result.ok).toBe(true)
      expect(mockFollowupInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          support_record_id: "ref-123",
          description: "โรงพยาบาลตอบรับและนัดตรวจเรียบร้อย",
        }),
      )
    })
  })
})
