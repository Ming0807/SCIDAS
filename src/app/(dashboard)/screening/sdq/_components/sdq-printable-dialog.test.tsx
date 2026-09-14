import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { SdqPrintableDialog } from "./sdq-printable-dialog"
import type { SdqPrintData } from "@/lib/sdq-constants"

const mockSdqData: SdqPrintData = {
  studentId: "student-123",
  studentName: "สมชาย ใจดี",
  studentCode: "STD-001",
  classroomLabel: "ม.1/1",
  studentNumber: 15,
  evaluatorType: "teacher",
  evaluatorName: "ครูสมศรี มีสุข",
  assessmentDate: "14 ก.ย. 2567",
  semesterLabel: "ภาคเรียนที่ 1",
  academicYear: "2567",
  dimensionScores: {
    emotional: 2,
    conduct: 1,
    hyperactivity: 3,
    peer: 2,
    prosocial: 8,
  },
  dimensionClassifications: {
    emotional: "normal",
    conduct: "normal",
    hyperactivity: "normal",
    peer: "normal",
    prosocial: "normal",
  },
  totalDifficultiesScore: 8,
  overallClassification: "normal",
  recommendations: "นักเรียนมีพัฒนาการดีเด่นในทุกมิติ",
  notes: "ไม่มีข้อสังเกตเพิ่มเติม",
}

describe("SdqPrintableDialog", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <SdqPrintableDialog isOpen={false} onClose={vi.fn()} data={mockSdqData} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders official header and student information when open", () => {
    render(<SdqPrintableDialog isOpen={true} onClose={vi.fn()} data={mockSdqData} />)

    expect(
      screen.getByText("สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน • กระทรวงศึกษาธิการ")
    ).toBeInTheDocument()
    expect(
      screen.getByText("แบบรายงานสรุปผลการประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)")
    ).toBeInTheDocument()
    expect(screen.getByText("สมชาย ใจดี")).toBeInTheDocument()
    expect(screen.getByText("STD-001")).toBeInTheDocument()
    expect(screen.getByText("ม.1/1")).toBeInTheDocument()
  })

  it("renders the 5 dimensions table, total difficulties, and 3-party signatures", () => {
    render(<SdqPrintableDialog isOpen={true} onClose={vi.fn()} data={mockSdqData} />)

    expect(screen.getByText("ด้านอารมณ์")).toBeInTheDocument()
    expect(screen.getByText("ด้านความประพฤติ/เกเร")).toBeInTheDocument()
    expect(screen.getByText("ด้านพฤติกรรมไม่อยู่นิ่ง/สมาธิสั้น")).toBeInTheDocument()
    expect(screen.getByText("ด้านความสัมพันธ์กับเพื่อน")).toBeInTheDocument()
    expect(
      screen.getByText("รวมความยากลำบาก 4 ด้าน (Total Difficulties)")
    ).toBeInTheDocument()

    // 3-Party signature roles
    expect(screen.getByText("ครูประเมิน / ครูประจำชั้น")).toBeInTheDocument()
    expect(
      screen.getByText("ครูแนะแนว / หัวหน้างานดูแลช่วยเหลือนักเรียน")
    ).toBeInTheDocument()
    expect(screen.getByText("ผู้อำนวยการสถานศึกษา")).toBeInTheDocument()
  })

  it("triggers window.print when print button is clicked", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {})
    render(<SdqPrintableDialog isOpen={true} onClose={vi.fn()} data={mockSdqData} />)

    const printButton = screen.getByRole("button", { name: /สั่งพิมพ์เอกสาร/i })
    fireEvent.click(printButton)

    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })
})
