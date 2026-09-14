import { render, screen, fireEvent } from "@testing-library/react"
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

  it("renders action buttons including assessment link and print trigger", () => {
    render(<SdqTableActions student={student} />)

    expect(screen.getByText("ทำแบบประเมิน SDQ")).toBeInTheDocument()
    expect(screen.getByTitle("พิมพ์รายงาน SDQ (ฉบับทางการ)")).toBeInTheDocument()
  })

  it("opens SDQ printable dialog when print button is clicked", () => {
    render(<SdqTableActions student={student} />)

    // Initially modal is closed
    expect(
      screen.queryByText("แบบรายงานสรุปผลการประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)")
    ).not.toBeInTheDocument()

    // Click print button
    const printButton = screen.getByTitle("พิมพ์รายงาน SDQ (ฉบับทางการ)")
    fireEvent.click(printButton)

    // Modal is now open
    expect(
      screen.getByText("แบบรายงานสรุปผลการประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)")
    ).toBeInTheDocument()
    expect(screen.getByText("กิตติพงษ์ เรียนดี")).toBeInTheDocument()
    expect(screen.getByText("STD-101")).toBeInTheDocument()
  })
})
