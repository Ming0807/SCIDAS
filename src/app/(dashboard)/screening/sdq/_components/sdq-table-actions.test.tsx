import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SdqTableActions } from "./sdq-table-actions"

describe("SdqTableActions", () => {
  const student = {
    studentId: "s-001",
    studentCode: "STD-101",
    fullName: "กิตติพงษ์ เรียนดี",
    classroomName: "ม.2/1",
    studentNumber: 5,
    riskLevel: "watch",
    riskScore: 17,
  }

  it("renders assessment link with honest print guidance", () => {
    render(<SdqTableActions student={student} />)

    expect(screen.getByText("ทำแบบประเมิน SDQ")).toBeInTheDocument()
    expect(
      screen.getByText("พิมพ์รายงานได้หลังบันทึกผลประเมิน"),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /ทำแบบประเมิน SDQ/ }),
    ).toHaveAttribute("href", "/screening/sdq/s-001")
  })

  it("does not render synthetic score preview", () => {
    const { container } = render(<SdqTableActions student={student} />)

    // No estimated dimension scores derived from riskScore may remain
    expect(container.textContent).not.toMatch(/โดยประมาณ/)
  })
})
