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

vi.mock("@/app/actions/student.actions", () => ({
  getStudentById: vi.fn(async () => ({
    id: "S001",
    prefix: "เด็กชาย",
    first_name: "กฤษฎา",
    last_name: "ใจดี",
    student_code: "12345",
    status: "active",
    gender: "male",
    date_of_birth: "2012-01-01",
    blood_type: "O",
  })),
}))

describe("Students Module", () => {
  describe("Students List Page", () => {
    it("renders the students heading and data table", () => {
      render(<StudentsPage />)
      expect(screen.getByRole("heading", { name: "ข้อมูลนักเรียนและการจัดการ" })).toBeDefined()
      expect(screen.getAllByPlaceholderText("ค้นหาชื่อนักเรียน, เลขประจำตัว...").length).toBeGreaterThan(0)
      expect(screen.getAllByText("เด็กชายกฤษฎา ใจดี").length).toBeGreaterThan(0)
    })
  })

  describe("Student Profile Page", () => {
    it("renders the student profile tabs and information", async () => {
      // Resolve the params promise since we mocked it as async component
      const Page = await StudentProfilePage({ params: Promise.resolve({ id: "S001" }) })
      render(Page)
      
      expect(screen.getByRole("heading", { name: "เด็กชายกฤษฎา ใจดี" })).toBeDefined()
      
      // Tabs
      expect(screen.getByRole("tab", { name: "ข้อมูลพื้นฐาน" })).toBeDefined()
      expect(screen.getByRole("tab", { name: "การเข้าเรียน" })).toBeDefined()
      expect(screen.getByRole("tab", { name: "ผลการเรียน" })).toBeDefined()
      expect(screen.getByRole("tab", { name: "พฤติกรรม" })).toBeDefined()
    })
  })
})
