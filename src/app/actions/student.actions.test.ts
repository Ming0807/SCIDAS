import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  createStudentAction,
  updateStudentAction,
  searchStudentsQuickAction,
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

    it("rejects invalid national_id, postal_code, distance, and blood_type", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("first_name", "Somchai")
      formData.set("last_name", "Jaidee")
      formData.set("student_code", "STU002")
      formData.set("gender", "male")
      formData.set("date_of_birth", "2015-05-10")
      formData.set("national_id", "12345")
      formData.set("postal_code", "3611")
      formData.set("distance_to_school_km", "-2")
      formData.set("blood_type", "Z")

      const result = await createStudentAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.national_id).toBeDefined()
        expect(result.fieldErrors?.postal_code).toBeDefined()
        expect(result.fieldErrors?.distance_to_school_km).toBeDefined()
        expect(result.fieldErrors?.blood_type).toBeDefined()
      }
    })

    it("persists extended profile fields on create", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "stu-101" }, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert })

      // @ts-expect-error mock client
      vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom })

      const formData = new FormData()
      formData.set("first_name", "Somchai")
      formData.set("last_name", "Jaidee")
      formData.set("student_code", "STU101")
      formData.set("gender", "male")
      formData.set("date_of_birth", "2015-05-10")
      formData.set("national_id", "1369900123456")
      formData.set("travel_method", "รถรับส่ง")
      formData.set("distance_to_school_km", "2.5")
      formData.set("subdistrict", "ในเมือง")
      formData.set("district", "เมือง")
      formData.set("province", "ชัยภูมิ")
      formData.set("postal_code", "36000")
      formData.set("blood_type", "o+")
      formData.set("medical_conditions", "หอบหืด")
      formData.set("special_needs", "ที่นั่งหน้าชั้น")

      const result = await createStudentAction(null, formData)
      expect(result.ok).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          national_id: "1369900123456",
          travel_method: "รถรับส่ง",
          distance_to_school_km: 2.5,
          subdistrict: "ในเมือง",
          district: "เมือง",
          province: "ชัยภูมิ",
          postal_code: "36000",
          blood_type: "O+",
          medical_conditions: "หอบหืด",
          special_needs: "ที่นั่งหน้าชั้น",
        }),
      )
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

  describe("searchStudentsQuickAction", () => {
    it("returns empty array for empty or whitespace query", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await searchStudentsQuickAction("   ")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data).toEqual([])
      }
    })

    it("returns empty array if user has no schoolId", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await searchStudentsQuickAction("สมชาย")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data).toEqual([])
      }
    })

    it("queries v_student_worklist and returns mapped results", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            {
              student_id: "stu-1",
              student_code: "1001",
              full_name: "ด.ช. ธีรภัทร ใจดี",
              classroom_name: "ม.1/1",
              risk_level: "watch",
              photo_url: "https://example.com/p1.jpg",
            },
          ],
          error: null,
        }),
      }

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      }

      // @ts-expect-error mock client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await searchStudentsQuickAction("ธีรภัทร")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].id).toBe("stu-1")
        expect(result.data[0].studentCode).toBe("1001")
        expect(result.data[0].fullName).toBe("ด.ช. ธีรภัทร ใจดี")
        expect(result.data[0].classroomName).toBe("ม.1/1")
        expect(result.data[0].riskLevel).toBe("watch")
      }
      expect(mockClient.from).toHaveBeenCalledWith("v_student_worklist")
    })
  })
})

