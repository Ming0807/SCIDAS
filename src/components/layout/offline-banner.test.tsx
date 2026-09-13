import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { OfflineBanner } from "./offline-banner"

const mockUseRealtime = vi.fn()

vi.mock("@/components/providers/realtime-provider", () => ({
  useRealtime: () => mockUseRealtime(),
}))

describe("OfflineBanner", () => {
  it("renders nothing when online", () => {
    mockUseRealtime.mockReturnValue({ isOnline: true })
    const { container } = render(<OfflineBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders status banner when offline", () => {
    mockUseRealtime.mockReturnValue({ isOnline: false })
    render(<OfflineBanner />)

    const banner = screen.getByRole("status")
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent("ขาดการเชื่อมต่ออินเทอร์เน็ต")
  })
})
