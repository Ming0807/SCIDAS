import { describe, it, expect, vi, beforeEach } from "vitest"

import { updateOwnProfile } from "./settings.actions"

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

describe("settings.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("updateOwnProfile", () => {
    it("fails with FORBIDDEN if user has no profileId", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: null,
        studentId: null,
      })

      const formData = new FormData()
      formData.set("first_name", "Somchai")
      formData.set("last_name", "Jaidee")

      const result = await updateOwnProfile(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if first_name is empty", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("first_name", "")
      formData.set("last_name", "Jaidee")

      const result = await updateOwnProfile(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.first_name).toBeDefined()
      }
    })

    it("fails with VALIDATION_ERROR if last_name is empty", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      formData.set("first_name", "Somchai")
      formData.set("last_name", "   ")

      const result = await updateOwnProfile(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.last_name).toBeDefined()
      }
    })

    it("fails with VALIDATION_ERROR if avatar_url is invalid protocol", async () => {
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
      formData.set("avatar_url", "javascript:alert(1)")

      const result = await updateOwnProfile(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.avatar_url).toBeDefined()
      }
    })

    it("updates profile successfully and revalidates paths", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          update: mockUpdate,
        }),
      })

      const formData = new FormData()
      formData.set("first_name", "Somchai")
      formData.set("last_name", "Jaidee")
      formData.set("phone", "0812345678")
      formData.set("position", "Math Teacher")
      formData.set("avatar_url", "https://example.com/avatar.jpg")

      const result = await updateOwnProfile(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.saved).toBe(true)
      }

      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: "Somchai",
        last_name: "Jaidee",
        phone: "0812345678",
        position: "Math Teacher",
        avatar_url: "https://example.com/avatar.jpg",
      })

      expect(revalidatePath).toHaveBeenCalledWith("/settings")
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout")
    })
  })
})
