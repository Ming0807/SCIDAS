import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateReportArtifact } from "./report-generator"

const mockFrom = vi.fn()

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}))

describe("Report Generator Filter Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should generate student summary with classroom filter", async () => {
    const mockOrder2 = vi.fn().mockReturnValue({
      range: vi.fn().mockResolvedValue({
        data: [
          {
            student_id: "s-1",
            student_code: "STD101",
            full_name: "สมชาย ใจดี",
            grade_level: "ม.1",
            classroom_name: "ม.1/1",
            risk_level: "normal",
            attendance_rate_30d: 95,
            open_support_count: 0,
            primary_guardian_name: "สมพร",
            primary_guardian_phone: "0812345678",
          },
        ],
        error: null,
      }),
    })
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
    const mockEqClassroom = vi.fn().mockReturnValue({ order: mockOrder1 })
    const mockEqSchool = vi.fn().mockReturnValue({ eq: mockEqClassroom, order: mockOrder1 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSchool })

    mockFrom.mockImplementation((table: string) => {
      if (table === "schools") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { name: "โรงเรียนอนุบาลพัฒนา", school_code: "SCH001" }, error: null }),
            }),
          }),
        }
      }
      if (table === "v_student_worklist") {
        return {
          select: mockSelect,
        }
      }
      return {}
    })

    const artifact = await generateReportArtifact({
      id: "job-1",
      schoolId: "school-1",
      reportType: "student_summary",
      title: "รายงานสรุปนักเรียน ม.1/1",
      filters: { classroomId: "c-1", format: "pdf" },
    })

    expect(artifact.fileName).toContain(".pdf")
    expect(artifact.contentType).toBe("application/pdf")
    expect(artifact.buffer.length).toBeGreaterThan(0)
    expect(mockEqClassroom).toHaveBeenCalledWith("classroom_id", "c-1")
  })

  it("should generate attendance report with date range filters", async () => {
    const mockRange = vi.fn().mockResolvedValue({
      data: [
        {
          id: "att-1",
          date: "2026-06-15",
          status: "present",
          remark: null,
          students: { student_code: "STD101", first_name: "สมชาย", last_name: "ใจดี" },
          classrooms: { name: "ม.1/1" },
        },
      ],
      error: null,
    })
    const mockOrder2 = vi.fn().mockReturnValue({ range: mockRange })
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 })
    const mockLteDate = vi.fn().mockReturnValue({ order: mockOrder1 })
    const mockGteDate = vi.fn().mockReturnValue({ lte: mockLteDate, order: mockOrder1 })
    const mockEqSchool = vi.fn().mockReturnValue({ gte: mockGteDate, order: mockOrder1 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSchool })

    mockFrom.mockImplementation((table: string) => {
      if (table === "schools") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { name: "โรงเรียนอนุบาลพัฒนา", school_code: "SCH001" }, error: null }),
            }),
          }),
        }
      }
      if (table === "attendance_records") {
        return {
          select: mockSelect,
        }
      }
      return {}
    })

    const artifact = await generateReportArtifact({
      id: "job-2",
      schoolId: "school-1",
      reportType: "attendance_report",
      title: "รายงานการมาเรียนประจำเดือน",
      filters: { dateFrom: "2026-06-01", dateTo: "2026-06-30", format: "xlsx" },
    })

    expect(artifact.fileName).toContain(".xlsx")
    expect(artifact.contentType).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    expect(artifact.buffer.length).toBeGreaterThan(0)
    expect(mockGteDate).toHaveBeenCalledWith("date", "2026-06-01")
    expect(mockLteDate).toHaveBeenCalledWith("date", "2026-06-30")
  })
})
