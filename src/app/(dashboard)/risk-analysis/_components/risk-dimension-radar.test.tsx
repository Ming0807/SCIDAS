import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { RiskDimensionRadar } from "./risk-dimension-radar"

describe("RiskDimensionRadar", () => {
  it("renders the 8-dimension radar heading and default OBEC dimensions", () => {
    render(<RiskDimensionRadar />)

    expect(screen.getByText("เรดาร์วิเคราะห์ 8 มิติ สพฐ.")).toBeInTheDocument()
    expect(screen.getByText("OBEC 8-Radar")).toBeInTheDocument()
    expect(screen.getByText("ด้านการเรียน")).toBeInTheDocument()
    expect(screen.getByText("สุขภาพ")).toBeInTheDocument()
    expect(screen.getByText("เศรษฐกิจ")).toBeInTheDocument()
    expect(screen.getByText("สัญญาณทั้ง 8 มิติอยู่ในเกณฑ์ควบคุม")).toBeInTheDocument()
  })

  it("highlights vulnerable dimensions with highRiskCount > 0", () => {
    const mockBenchmarks = [
      {
        dimensionKey: "economic",
        dimensionLabel: "ด้านเศรษฐกิจและครอบครัว",
        averageScore: 4.2,
        highRiskCount: 15,
        watchRiskCount: 5,
      },
    ]

    render(<RiskDimensionRadar benchmarks={mockBenchmarks} />)

    expect(screen.getByText(/จุดเปราะบางสูงสุด/)).toBeInTheDocument()
    expect(screen.getAllByText(/เศรษฐกิจ/).length).toBeGreaterThanOrEqual(1)
  })
})
