import { describe, it, expect, vi, beforeEach } from "vitest"

import { removeStudentPhotoAction, uploadStudentPhotoAction } from "./student-photo.actions"

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

function pngFile(size = 1024): File {
  return new File([new Uint8Array(size)], "photo.png", { type: "image/png" })
}

describe("student-photo.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("uploadStudentPhotoAction", () => {
    it("fails with FORBIDDEN for subject_teacher", async () => {
      mockContext("subject_teacher")
      const result = await uploadStudentPhotoAction({ student_id: "stu-1", file: pngFile() })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("fails with VALIDATION_ERROR for non-image files", async () => {
      mockContext()
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "stu-1", photo_url: null },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const pdf = new File([new Uint8Array(10)], "doc.pdf", { type: "application/pdf" })
      const result = await uploadStudentPhotoAction({ student_id: "stu-1", file: pdf })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR")
    })

    it("fails with NOT_FOUND when student is outside the school", async () => {
      mockContext("admin")
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

      const result = await uploadStudentPhotoAction({ student_id: "stu-x", file: pngFile() })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("NOT_FOUND")
    })

    it("uploads, updates photo_url, and revalidates student surfaces", async () => {
      mockContext("admin")
      const mockUpload = vi.fn().mockResolvedValue({ error: null })
      const mockRemove = vi.fn().mockResolvedValue({ error: null })
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            remove: mockRemove,
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: "https://cdn.test/student-photos/stu-1/new.png" },
            }),
          }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "students") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "stu-1", photo_url: null },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
              }),
            }
          }
          return {}
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await uploadStudentPhotoAction({ student_id: "stu-1", file: pngFile() })
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.photoUrl).toBe("https://cdn.test/student-photos/stu-1/new.png")
      }
      expect(mockUpload).toHaveBeenCalled()
      expect(mockRemove).not.toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/students/stu-1")
    })
  })

  describe("removeStudentPhotoAction", () => {
    it("fails with FORBIDDEN for student role", async () => {
      mockContext("student", null)
      const result = await removeStudentPhotoAction({ student_id: "stu-1" })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.code).toBe("FORBIDDEN")
    })

    it("removes the stored object and clears photo_url", async () => {
      mockContext("counselor")
      const mockRemove = vi.fn().mockResolvedValue({ error: null })
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        storage: {
          from: vi.fn().mockReturnValue({ remove: mockRemove }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "stu-1",
                    photo_url: "https://cdn.test/storage/v1/object/public/student-photos/stu-1/old.png",
                  },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
          }),
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await removeStudentPhotoAction({ student_id: "stu-1" })
      expect(result.ok).toBe(true)
      expect(mockRemove).toHaveBeenCalledWith(["stu-1/old.png"])
      expect(revalidatePath).toHaveBeenCalledWith("/students/stu-1")
    })
  })
})
