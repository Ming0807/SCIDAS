import { render, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import { IdleLogout } from "./idle-logout"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  })),
}))

vi.mock("@/app/actions/auth.actions", () => ({
  signOutAction: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: { warning: vi.fn() },
}))

import { signOutAction } from "@/app/actions/auth.actions"
import { toast } from "sonner"

describe("IdleLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("signs out after the idle timeout with no activity", async () => {
    vi.mocked(signOutAction).mockResolvedValue({ ok: true, message: "ok", data: { success: true } })
    render(<IdleLogout timeoutMs={1000} />)

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(toast.warning).toHaveBeenCalled()
    expect(signOutAction).toHaveBeenCalledTimes(1)
  })

  it("resets the timer on user activity", async () => {
    vi.mocked(signOutAction).mockResolvedValue({ ok: true, message: "ok", data: { success: true } })
    render(<IdleLogout timeoutMs={1000} />)

    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    await act(async () => {
      window.dispatchEvent(new MouseEvent("mousedown"))
      vi.advanceTimersByTime(800)
    })

    expect(signOutAction).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(signOutAction).toHaveBeenCalledTimes(1)
  })
})
