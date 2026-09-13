import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Header } from "./header"

const mockUsePathname = vi.hoisted(() => vi.fn())

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn() }),
}))

describe("Header", () => {
  it("renders the notifications link", () => {
    mockUsePathname.mockReturnValue("/")
    render(<Header />)
    expect(
      screen.getByRole("link", { name: /การแจ้งเตือน/ }),
    ).toBeDefined()
  })

  it("renders the dynamic heading for the current route", () => {
    mockUsePathname.mockReturnValue("/students")
    render(<Header />)
    expect(
      screen.getByRole("heading", { name: /นักเรียน/ }),
    ).toBeDefined()
  })

  it("renders the default fallback heading for root or unknown route", () => {
    mockUsePathname.mockReturnValue("/")
    render(<Header />)
    expect(
      screen.getByRole("heading", { name: /ภาพรวม/ }),
    ).toBeDefined()
  })
})
