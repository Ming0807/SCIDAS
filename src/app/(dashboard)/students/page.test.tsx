import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import StudentsPage from "./page"
import StudentProfilePage from "./[id]/page"

// Mock router
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
    }
  },
}))

describe("Students Module", () => {
  describe("Students List Page", () => {
    it("renders the students heading and data table", () => {
      render(<StudentsPage />)
      expect(screen.getByRole("heading", { name: "Students" })).toBeDefined()
      expect(screen.getByPlaceholderText("Search students...")).toBeDefined()
      expect(screen.getByText("Alice Johnson")).toBeDefined()
    })
  })

  describe("Student Profile Page", () => {
    it("renders the student profile tabs and information", async () => {
      // Resolve the params promise since we mocked it as async component
      const Page = await StudentProfilePage({ params: Promise.resolve({ id: "S001" }) })
      render(Page)
      
      expect(screen.getByRole("heading", { name: "Alice Johnson" })).toBeDefined()
      
      // Tabs
      expect(screen.getByRole("tab", { name: "Overview" })).toBeDefined()
      expect(screen.getByRole("tab", { name: "Attendance" })).toBeDefined()
      expect(screen.getByRole("tab", { name: "Academics" })).toBeDefined()
      expect(screen.getByRole("tab", { name: "Behavior" })).toBeDefined()
    })
  })
})
