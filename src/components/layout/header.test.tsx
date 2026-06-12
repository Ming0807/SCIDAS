import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Header } from "./header"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/students",
}))

describe("Header", () => {
  it("renders the notifications link", () => {
    render(<Header />)
    expect(
      screen.getByRole("link", { name: /การแจ้งเตือน/ }),
    ).toBeDefined()
  })

  it("renders the heading", () => {
    render(<Header />)
    expect(
      screen.getByRole("heading", { name: /ภาพรวมระบบ/ }),
    ).toBeDefined()
  })
})
