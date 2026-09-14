import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { SdqAssessmentForm } from "./sdq-assessment-form"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock("@/app/actions/sdq.actions", () => ({
  saveSdqAssessmentAction: vi.fn().mockResolvedValue({ ok: true, data: {} }),
}))

describe("SdqAssessmentForm", () => {
  const student = {
    id: "stu-1",
    name: "วรรณภา สดใส",
    code: "STD-202",
    classroom: "ม.3/2",
  }

  it("renders student information and evaluator selector", () => {
    render(<SdqAssessmentForm student={student} />)

    expect(screen.getByText("วรรณภา สดใส")).toBeInTheDocument()
    expect(screen.getByText(/STD-202/)).toBeInTheDocument()
    expect(screen.getByText("ครูประเมิน")).toBeInTheDocument()
    expect(screen.getByText("นักเรียนประเมินตนเอง")).toBeInTheDocument()
    expect(screen.getByText("ผู้ปกครองประเมิน")).toBeInTheDocument()
  })

  it("opens SDQ printable dialog when print button is clicked", () => {
    render(<SdqAssessmentForm student={student} />)

    const printButtons = screen.getAllByRole("button", { name: /พิมพ์รายงาน SDQ/i })
    expect(printButtons.length).toBeGreaterThan(0)

    fireEvent.click(printButtons[0])

    expect(
      screen.getByText("แบบรายงานสรุปผลการประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)")
    ).toBeInTheDocument()
    expect(screen.getAllByText("วรรณภา สดใส").length).toBeGreaterThanOrEqual(2)
  })
})

