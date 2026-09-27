import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DesktopStatsCategory } from "./desktop-stats-category"
import { DesktopTrendComparison } from "./desktop-trend-comparison"
import { DesktopCreateReport } from "./desktop-create-report"
import { MobileTrendChart } from "./mobile/mobile-trend-chart"

vi.mock("@/app/actions/reports.actions", () => ({
  requestReportJobActionState: vi.fn(),
}))

describe("Report Analytics Components", () => {
  describe("DesktopStatsCategory", () => {
    it("renders empty state when factor distribution is empty", () => {
      render(<DesktopStatsCategory factorDistribution={{ factors: [], totalStudents: 0 }} />)
      expect(screen.getByText("ยังไม่มีข้อมูลปัจจัยเสี่ยง")).toBeDefined()
    })

    it("renders dynamic factor counts and labels when data is provided", () => {
      render(
        <DesktopStatsCategory
          factorDistribution={{
            factors: [
              { factorKey: "academic", factorLabel: "ผลการเรียนต่ำ", count: 12 },
              { factorKey: "attendance", factorLabel: "ขาดเรียนบ่อย", count: 5 },
            ],
            totalStudents: 15,
          }}
        />,
      )

      expect(screen.getByText("ผลการเรียนต่ำ")).toBeDefined()
      expect(screen.getByText("12")).toBeDefined()
      expect(screen.getByText("ขาดเรียนบ่อย")).toBeDefined()
      expect(screen.getByText("5")).toBeDefined()
      expect(screen.getByText("รวม 15 คน")).toBeDefined()
    })
  })

  describe("DesktopTrendComparison", () => {
    it("renders empty state when trend points are empty", () => {
      render(<DesktopTrendComparison trendData={[]} />)
      expect(screen.getByText("ยังไม่มีข้อมูลแนวโน้มย้อนหลัง")).toBeDefined()
    })

    it("renders trend points and period labels when data is provided", () => {
      render(
        <DesktopTrendComparison
          trendData={[
            { periodLabel: "เทอม 1/2567", highCount: 5, watchCount: 10, normalCount: 30, totalCount: 45 },
            { periodLabel: "เทอม 2/2567", highCount: 3, watchCount: 8, normalCount: 34, totalCount: 45 },
          ]}
        />,
      )

      expect(screen.getByText("เทอม 1/2567")).toBeDefined()
      expect(screen.getByText("เทอม 2/2567")).toBeDefined()
      expect(screen.getByText("2 ช่วงเวลา")).toBeDefined()
    })
  })

  describe("MobileTrendChart", () => {
    it("renders empty state when mobile trend points are empty", () => {
      render(<MobileTrendChart trendData={[]} />)
      expect(screen.getByText("ยังไม่มีข้อมูลแนวโน้มย้อนหลัง")).toBeDefined()
    })

    it("renders trend points when data is provided", () => {
      render(
        <MobileTrendChart
          trendData={[
            { periodLabel: "ม.ค. 2568", highCount: 2, watchCount: 4, normalCount: 20, totalCount: 26 },
            { periodLabel: "ก.พ. 2568", highCount: 1, watchCount: 3, normalCount: 22, totalCount: 26 },
          ]}
        />,
      )

      expect(screen.getByText("ม.ค. 2568")).toBeDefined()
      expect(screen.getByText("ก.พ. 2568")).toBeDefined()
    })
  })

  describe("DesktopCreateReport academic year filter", () => {
    const semesters = [
      { id: "sem-1", name: "ภาคเรียนที่ 1/2567", year: 2567 },
      { id: "sem-2", name: "ภาคเรียนที่ 2/2567", year: 2567 },
      { id: "sem-3", name: "ภาคเรียนที่ 1/2568", year: 2568 },
    ]

    it("lists every semester when no year is selected", () => {
      render(<DesktopCreateReport semesters={semesters} />)

      const semesterSelect = screen.getByLabelText("ภาคเรียน") as HTMLSelectElement
      const options = Array.from(semesterSelect.options).map((o) => o.text)
      expect(options).toContain("ภาคเรียนที่ 1/2567")
      expect(options).toContain("ภาคเรียนที่ 1/2568")
    })

    it("narrows semester options after picking an academic year", () => {
      render(<DesktopCreateReport semesters={semesters} />)

      fireEvent.change(screen.getByLabelText("ปีการศึกษา"), { target: { value: "2568" } })

      const semesterSelect = screen.getByLabelText("ภาคเรียน") as HTMLSelectElement
      const options = Array.from(semesterSelect.options).map((o) => o.text)
      expect(options).toContain("ภาคเรียนที่ 1/2568")
      expect(options).not.toContain("ภาคเรียนที่ 1/2567")
      expect(options).not.toContain("ภาคเรียนที่ 2/2567")
    })
  })
})
