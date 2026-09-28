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

  it("disables printing until all 25 questions are answered, then opens the dialog", () => {
    render(<SdqAssessmentForm student={student} />)

    const toolbarPrint = screen
      .getAllByRole("button", { name: /พิมพ์รายงาน SDQ/i })
      .find((button) => button instanceof HTMLButtonElement && button.disabled)
    expect(toolbarPrint).toBeDefined()

    const notTrueButtons = screen.getAllByRole("button", { name: "ไม่จริง" })
    expect(notTrueButtons).toHaveLength(25)
    for (const button of notTrueButtons) {
      fireEvent.click(button)
    }

    const enabledPrintButtons = screen
      .getAllByRole("button", { name: /พิมพ์รายงาน SDQ/i })
      .filter((button) => button instanceof HTMLButtonElement && !button.disabled)
    expect(enabledPrintButtons.length).toBeGreaterThan(0)
    fireEvent.click(enabledPrintButtons[0])

    expect(
      screen.getByText("แบบรายงานสรุปผลการประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)")
    ).toBeInTheDocument()
    expect(screen.getAllByText("วรรณภา สดใส").length).toBeGreaterThanOrEqual(2)
  })
})

