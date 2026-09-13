import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { CommandPalette } from "./command-palette"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockSetTheme = vi.fn()
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
  }),
}))

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("does not render when isOpen is false", () => {
    const { container } = render(<CommandPalette isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders search input and action list when isOpen is true", () => {
    render(<CommandPalette isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByPlaceholderText(/ค้นหาเมนู/)).toBeInTheDocument()
    expect(screen.getByText(/ภาพรวมระบบ/)).toBeInTheDocument()
    expect(screen.getByText(/รายชื่อนักเรียน/)).toBeInTheDocument()
  })

  it("filters action list according to search query", () => {
    render(<CommandPalette isOpen={true} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText(/ค้นหาเมนู/)
    fireEvent.change(input, { target: { value: "เยี่ยมบ้าน" } })

    expect(screen.getByText("การเยี่ยมบ้าน (Home Visits)")).toBeInTheDocument()
    expect(screen.queryByText(/ผลการเรียนและคะแนน/)).not.toBeInTheDocument()
  })

  it("navigates and closes on item click", () => {
    const handleClose = vi.fn()
    render(<CommandPalette isOpen={true} onClose={handleClose} />)

    const studentsOption = screen.getByText(/รายชื่อนักเรียน/)
    fireEvent.click(studentsOption)

    expect(mockPush).toHaveBeenCalledWith("/students")
    expect(handleClose).toHaveBeenCalled()
  })

  it("closes when Escape key is pressed", () => {
    const handleClose = vi.fn()
    render(<CommandPalette isOpen={true} onClose={handleClose} />)

    const input = screen.getByPlaceholderText(/ค้นหาเมนู/)
    fireEvent.keyDown(input, { key: "Escape" })

    expect(handleClose).toHaveBeenCalled()
  })
})
