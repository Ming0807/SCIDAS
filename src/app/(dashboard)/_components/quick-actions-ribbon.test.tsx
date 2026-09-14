import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { QuickActionsRibbon } from "./quick-actions-ribbon"

describe("QuickActionsRibbon", () => {
  it("renders all 6 core quick actions", () => {
    render(<QuickActionsRibbon />)

    expect(screen.getByText("เช็คชื่อประจำวัน")).toBeInTheDocument()
    expect(screen.getByText("คัดกรอง SDQ")).toBeInTheDocument()
    expect(screen.getByText("บันทึกเยี่ยมบ้าน")).toBeInTheDocument()
    expect(screen.getByText("บันทึกพฤติกรรม")).toBeInTheDocument()
    expect(screen.getByText("เปิดเคสช่วยเหลือ")).toBeInTheDocument()
    expect(screen.getByText("พิมพ์รายงาน / SAR")).toBeInTheDocument()
  })

  it("links to correct system routes", () => {
    render(<QuickActionsRibbon />)

    expect(screen.getByText("เช็คชื่อประจำวัน").closest("a")).toHaveAttribute("href", "/attendance")
    expect(screen.getByText("คัดกรอง SDQ").closest("a")).toHaveAttribute("href", "/screening/sdq")
    expect(screen.getByText("บันทึกเยี่ยมบ้าน").closest("a")).toHaveAttribute("href", "/home-visits/new")
    expect(screen.getByText("บันทึกพฤติกรรม").closest("a")).toHaveAttribute("href", "/behavior/record")
    expect(screen.getByText("เปิดเคสช่วยเหลือ").closest("a")).toHaveAttribute("href", "/support/new")
    expect(screen.getByText("พิมพ์รายงาน / SAR").closest("a")).toHaveAttribute("href", "/reports")
  })
})
