import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { signOutAction } from "./auth.actions"

describe("auth.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("successfully signs out and redirects to /login", async () => {
    const mockSignOut = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        signOut: mockSignOut,
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>)

    await expect(signOutAction()).rejects.toThrow("REDIRECT:/login")
    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout")
    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("handles sign out error gracefully without throwing unexpected exception", async () => {
    const mockSignOut = vi.fn().mockResolvedValue({
      error: { message: "Network error during signout" },
    })
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        signOut: mockSignOut,
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>)

    const result = await signOutAction()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe("INTERNAL_ERROR")
      expect(result.message).toContain("เกิดข้อผิดพลาดในการออกจากระบบ")
    }
  })
})
