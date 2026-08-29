import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  claimReportJob,
  completeReportJob,
  deleteReportJob,
  failReportJob,
  getReportTypeLabel,
  isReportJobType,
  recoverStaleReportJobs,
  reportJobTypes,
  retryReportJob,
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
const mockRpc = vi.fn()
const mockStorageFrom = vi.fn()

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
    rpc: mockRpc,
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

  describe("Database lifecycle RPCs", () => {
    it("claims a job through the DB RPC and returns its claim token", async () => {
      const claim = {
        id: "job-1",
        school_id: "school-1",
        report_type: "student_summary",
        title: "รายงานนักเรียน",
        filters: {},
        claim_token: "token-1",
      }
      const maybeSingle = vi.fn().mockResolvedValue({ data: claim, error: null })
      mockRpc.mockReturnValue({ maybeSingle })

      await expect(claimReportJob("job-1")).resolves.toEqual(claim)
      expect(mockRpc).toHaveBeenCalledWith("claim_report_job", { p_job_id: "job-1" })
      expect(maybeSingle).toHaveBeenCalledOnce()
    })

    it("uses the claim token for completion and failure transitions", async () => {
      mockRpc.mockResolvedValue({ data: true, error: null })

      await expect(completeReportJob("job-1", "token-1", "school-1/report.pdf")).resolves.toBe(true)
      expect(mockRpc).toHaveBeenNthCalledWith(1, "complete_report_job", {
        p_job_id: "job-1",
        p_claim_token: "token-1",
        p_output_path: "school-1/report.pdf",
      })

      await expect(failReportJob("job-1", "token-1", "generation failed")).resolves.toBe(true)
      expect(mockRpc).toHaveBeenNthCalledWith(2, "fail_report_job", {
        p_job_id: "job-1",
        p_claim_token: "token-1",
        p_error_message: "generation failed",
      })
    })

    it("recovers stale jobs through a tenant-scoped RPC", async () => {
      mockRpc.mockResolvedValue({ data: 2, error: null })

      await expect(recoverStaleReportJobs()).resolves.toEqual({ recoveredCount: 2 })
      expect(mockRpc).toHaveBeenCalledWith(
        "recover_stale_report_jobs",
        expect.objectContaining({ p_stale_before: expect.any(String) }),
      )
      expect(mockFrom).not.toHaveBeenCalledWith("report_jobs")
    })

    it("retries through the DB RPC instead of a broad report_jobs update", async () => {
      mockRpc.mockResolvedValue({ data: true, error: null })

      await expect(retryReportJob("job-1")).resolves.toBe(true)
      expect(mockRpc).toHaveBeenCalledWith("retry_report_job", { p_job_id: "job-1" })
      expect(mockFrom).not.toHaveBeenCalledWith("report_jobs")
    })
  })

  describe("deleteReportJob", () => {
    function setupDeleteJob() {
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
      const mockEqSchoolDelete = vi.fn().mockResolvedValue({ error: null })
      const mockEqIdDelete = vi.fn().mockReturnValue({ eq: mockEqSchoolDelete })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEqIdDelete })

      mockFrom.mockReturnValue({
        select: mockSelect,
        delete: mockDelete,
      })

      return { mockDelete }
    }

    it("deletes the Storage object before deleting the DB row", async () => {
      const { mockDelete } = setupDeleteJob()
      const mockRemove = vi.fn().mockResolvedValue({ error: null })
      mockStorageFrom.mockReturnValue({ remove: mockRemove })

      await expect(deleteReportJob("job-1")).resolves.toEqual({ success: true })
      expect(mockStorageFrom).toHaveBeenCalledWith("reports")
      expect(mockRemove).toHaveBeenCalledWith(["school-1/student_summary.pdf"])
      expect(mockDelete).toHaveBeenCalledOnce()
    })

    it("preserves the DB row when Storage deletion fails", async () => {
      const { mockDelete } = setupDeleteJob()
      mockStorageFrom.mockReturnValue({
        remove: vi.fn().mockResolvedValue({ error: new Error("storage denied") }),
      })

      await expect(deleteReportJob("job-1")).rejects.toThrow("STORAGE_DELETE_FAILED")
      expect(mockDelete).not.toHaveBeenCalled()
    })
  })
})
