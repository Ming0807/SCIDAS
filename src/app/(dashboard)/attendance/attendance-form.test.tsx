import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AttendanceForm } from "./attendance-form"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock("@/components/providers/realtime-provider", () => ({
  useRealtime: () => ({
    isOnline: true,
    lastAttendanceChange: null,
  }),
}))

vi.mock("@/app/actions/attendance.actions", () => ({
  upsertAttendance: vi.fn().mockResolvedValue({ ok: true, data: { count: 2 } }),
}))

const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

const mockStorage = createLocalStorageMock()
Object.defineProperty(globalThis, "localStorage", {
  value: mockStorage,
  writable: true,
})

describe("AttendanceForm", () => {
  const mockClassroom = { id: "cls-1", name: "ม.1/1" }
  const mockStudents = [
    { id: "stu-1", name: "สมชาย ใจดี", studentCode: "10001" },
    { id: "stu-2", name: "สมหญิง รักเรียน", studentCode: "10002" },
  ]
  const mockInitialRecords = [
    { student_id: "stu-1", status: "present" as const, check_in_time: "07:55", remark: null },
    { student_id: "stu-2", status: "present" as const, check_in_time: "07:58", remark: null },
  ]

  beforeEach(() => {
    mockStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockStorage.clear()
  })

  it("renders attendance form with student list and counts", () => {
    render(
      <AttendanceForm
        classroom={mockClassroom}
        students={mockStudents}
        initialRecords={mockInitialRecords}
        dateStr="2026-09-15"
      />,
    )

    expect(screen.getByText(/บันทึกการมาเรียน · ม.1\/1/)).toBeInTheDocument()
    expect(screen.getAllByText("สมชาย ใจดี")[0]).toBeInTheDocument()
    expect(screen.getAllByText("สมหญิง รักเรียน")[0]).toBeInTheDocument()
  })

  it("displays local draft banner when offline draft exists in localStorage", () => {
    const draftKey = `scidas_att_draft_${mockClassroom.id}_2026-09-15`
    const draftData = {
      "stu-1": { status: "absent", checkInTime: "", remark: "ป่วย" },
      "stu-2": { status: "present", checkInTime: "08:00", remark: "" },
    }
    localStorage.setItem(draftKey, JSON.stringify(draftData))

    render(
      <AttendanceForm
        classroom={mockClassroom}
        students={mockStudents}
        initialRecords={mockInitialRecords}
        dateStr="2026-09-15"
      />,
    )

    expect(screen.getByText("พบข้อมูลเช็คชื่อฉบับร่างที่บันทึกไว้ในเครื่องนี้ (ออฟไลน์)")).toBeInTheDocument()
    expect(screen.getByText("กู้คืนข้อมูลร่าง")).toBeInTheDocument()
    expect(screen.getByText("ละทิ้ง")).toBeInTheDocument()
  })

  it("restores draft when 'กู้คืนข้อมูลร่าง' is clicked", () => {
    const draftKey = `scidas_att_draft_${mockClassroom.id}_2026-09-15`
    const draftData = {
      "stu-1": { status: "absent", checkInTime: "", remark: "ขาดเรียน" },
      "stu-2": { status: "present", checkInTime: "08:00", remark: "" },
    }
    localStorage.setItem(draftKey, JSON.stringify(draftData))

    render(
      <AttendanceForm
        classroom={mockClassroom}
        students={mockStudents}
        initialRecords={mockInitialRecords}
        dateStr="2026-09-15"
      />,
    )

    const restoreBtn = screen.getByText("กู้คืนข้อมูลร่าง")
    fireEvent.click(restoreBtn)

    // Draft banner should disappear once restored
    expect(screen.queryByText("พบข้อมูลเช็คชื่อฉบับร่างที่บันทึกไว้ในเครื่องนี้ (ออฟไลน์)")).not.toBeInTheDocument()
  })

  it("discards draft when 'ละทิ้ง' is clicked", () => {
    const draftKey = `scidas_att_draft_${mockClassroom.id}_2026-09-15`
    const draftData = {
      "stu-1": { status: "absent", checkInTime: "", remark: "ขาดเรียน" },
    }
    localStorage.setItem(draftKey, JSON.stringify(draftData))

    render(
      <AttendanceForm
        classroom={mockClassroom}
        students={mockStudents}
        initialRecords={mockInitialRecords}
        dateStr="2026-09-15"
      />,
    )

    const discardBtn = screen.getByText("ละทิ้ง")
    fireEvent.click(discardBtn)

    expect(localStorage.getItem(draftKey)).toBeNull()
    expect(screen.queryByText("พบข้อมูลเช็คชื่อฉบับร่างที่บันทึกไว้ในเครื่องนี้ (ออฟไลน์)")).not.toBeInTheDocument()
  })
})
