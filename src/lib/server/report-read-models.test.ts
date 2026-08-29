import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getReportTypeLabel,
  isReportJobType,
  reportJobTypes,
  recoverStaleReportJobs,
  deleteReportJob,
} from "./report-read-models"

vi.mock("./current-user", () => ({
  getCurrentUserContext: vi.fn(async () => ({
    userId: "user-1",
    profileId: "profile-1",
    schoolId: "school-1",
    role: "admin",
  })),
}))

const mockFrom = vi.fn()
const mockStorageFrom = vi.fn()

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
  })),
}))

describe("Report Read Models & Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Metadata & Helpers", () => {
    it("should return correct Thai labels for report types", () => {
      expect(getReportTypeLabel("student_summary")).toBe("รายงานสรุปนักเรียน")
      expect(getReportTypeLabel("risk_report")).toBe("รายงานกลุ่มเสี่ยง")
      expect(getReportTypeLabel("attendance_report")).toBe("รายงานการมาเรียน")
      expect(getReportTypeLabel("academic_report")).toBe("รายงานผลการเรียน")
      expect(getReportTypeLabel("unknown_custom_report")).toBe("unknown custom report")
    })

    it("should validate recognized report job types", () => {
      for (const type of reportJobTypes) {
        expect(isReportJobType(type)).toBe(true)
      }
      expect(isReportJobType("invalid_type")).toBe(false)
    })
  })

  describe("recoverStaleReportJobs", () => {
    it("should update stale running jobs with timeout status", async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [{ id: "job-1" }, { id: "job-2" }],
        error: null,
      })
      const mockLt = vi.fn().mockReturnValue({ select: mockSelect })
      const mockEqStatus = vi.fn().mockReturnValue({ lt: mockLt })
      const mockEqSchool = vi.fn().mockReturnValue({ eq: mockEqStatus })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqSchool })

      mockFrom.mockReturnValue({ update: mockUpdate })

      const res = await recoverStaleReportJobs()
      expect(res.recoveredCount).toBe(2)
      expect(mockFrom).toHaveBeenCalledWith("report_jobs")
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "failed",
          error_message: expect.stringContaining("Timeout"),
        }),
      )
    })
  })

  describe("deleteReportJob", () => {
    it("should delete storage file and database row consistently", async () => {
      // 1. Mock select query for job info
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: {
          id: "job-1",
          school_id: "school-1",
          requested_by: "profile-1",
          output_bucket: "reports",
          output_path: "school-1/student_summary.pdf",
        },
        error: null,
      })
      const mockEqSchoolFetch = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockEqIdFetch = vi.fn().mockReturnValue({ eq: mockEqSchoolFetch })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEqIdFetch })

      // 2. Mock storage remove
      const mockRemove = vi.fn().mockResolvedValue({ error: null })
      mockStorageFrom.mockReturnValue({ remove: mockRemove })

      // 3. Mock delete query
      const mockEqSchoolDelete = vi.fn().mockResolvedValue({ error: null })
      const mockEqIdDelete = vi.fn().mockReturnValue({ eq: mockEqSchoolDelete })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEqIdDelete })

      mockFrom.mockImplementation((table: string) => {
        if (table === "report_jobs") {
          return {
            select: mockSelect,
            delete: mockDelete,
          }
        }
        return {}
      })

      const res = await deleteReportJob("job-1")
      expect(res.success).toBe(true)
      expect(mockStorageFrom).toHaveBeenCalledWith("reports")
      expect(mockRemove).toHaveBeenCalledWith(["school-1/student_summary.pdf"])
      expect(mockDelete).toHaveBeenCalled()
    })
  })
})
