import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  requestReportJobActionState,
  processReportJobAction,
  retryReportJobAction,
  deleteReportJobAction,
} from "./reports.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("next/server", () => ({
  after: vi.fn((callback: () => Promise<void>) => {
    // Immediately invoke or capture
    callback()
  }),
}))

vi.mock("@/lib/server/report-read-models", () => ({
  reportJobTypes: [
    "student_summary",
    "student_profile",
    "risk_report",
    "risk_assessment",
    "attendance_report",
    "attendance_summary",
    "academic_report",
    "grade_report",
    "screening_summary",
    "home_visit_summary",
    "support_summary",
    "idp_summary",
    "behavior_summary",
    "comprehensive",
  ],
  requestReportJob: vi.fn(),
  processReportJobById: vi.fn(),
  retryReportJob: vi.fn(),
  deleteReportJob: vi.fn(),
}))

vi.mock("@/lib/server/rate-limiter", () => ({
  checkRateLimit: vi.fn(() => ({
    allowed: true,
    remaining: 20,
    totalLimit: 30,
    resetTimeMs: Date.now() + 60000,
  })),
  resetRateLimits: vi.fn(),
}))

vi.mock("@/lib/server/audit-logger", () => ({
  logAudit: vi.fn().mockResolvedValue({ success: true, id: "audit-1" }),
}))

import {
  requestReportJob,
  processReportJobById,
  retryReportJob,
  deleteReportJob,
} from "@/lib/server/report-read-models"
import { checkRateLimit } from "@/lib/server/rate-limiter"
import { revalidatePath } from "next/cache"
import { after } from "next/server"

describe("reports.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("requestReportJobActionState", () => {
    it("fails with VALIDATION_ERROR if reportType is missing", async () => {
      const formData = new FormData()
      formData.set("title", "Term 1 Summary")

      const result = await requestReportJobActionState(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.reportType).toBeDefined()
      }
    })

    it("fails with VALIDATION_ERROR if reportType is invalid", async () => {
      const formData = new FormData()
      formData.set("reportType", "invalid_type")
      formData.set("title", "Term 1 Summary")

      const result = await requestReportJobActionState(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.reportType).toBeDefined()
      }
    })

    it("fails with VALIDATION_ERROR if title is missing", async () => {
      const formData = new FormData()
      formData.set("reportType", "student_profile")
      formData.set("title", "   ")

      const result = await requestReportJobActionState(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.title).toBeDefined()
      }
    })

    it("fails with VALIDATION_ERROR if title exceeds 255 characters", async () => {
      const formData = new FormData()
      formData.set("reportType", "student_profile")
      formData.set("title", "A".repeat(256))

      const result = await requestReportJobActionState(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.title).toBeDefined()
      }
    })

    it("requests report job successfully with parsed filters and schedules background execution", async () => {
      vi.mocked(requestReportJob).mockResolvedValueOnce({
        id: "job-123",
      })
      vi.mocked(processReportJobById).mockResolvedValueOnce({
        id: "job-123",
        status: "completed",
        downloadUrl: "https://example.com/report.pdf",
        errorMessage: null,
      })

      const formData = new FormData()
      formData.set("reportType", "behavior_summary")
      formData.set("title", "Monthly Behavior Report")
      formData.set("format", "xlsx")
      formData.set("classroomId", "cls-1")
      formData.set("semesterId", "sem-1")
      formData.set("studentId", "stu-1")
      formData.set("dateFrom", "2026-01-01")
      formData.set("dateTo", "2026-01-31")

      const result = await requestReportJobActionState(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("job-123")
      }

      expect(requestReportJob).toHaveBeenCalledWith({
        reportType: "behavior_summary",
        title: "Monthly Behavior Report",
        filters: {
          format: "xlsx",
          classroomId: "cls-1",
          semesterId: "sem-1",
          studentId: "stu-1",
          dateFrom: "2026-01-01",
          dateTo: "2026-01-31",
        },
      })

      expect(after).toHaveBeenCalled()
      expect(processReportJobById).toHaveBeenCalledWith("job-123")
      expect(revalidatePath).toHaveBeenCalledWith("/reports")
    })

    it("returns INTERNAL_ERROR if requestReportJob throws", async () => {
      vi.mocked(requestReportJob).mockRejectedValueOnce(new Error("Database error"))

      const formData = new FormData()
      formData.set("reportType", "student_profile")
      formData.set("title", "Profile Export")

      const result = await requestReportJobActionState(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("INTERNAL_ERROR")
      }
    })

    it("returns RATE_LIMITED when rate limit check fails", async () => {
      vi.mocked(checkRateLimit).mockReturnValueOnce({
        allowed: false,
        remaining: 0,
        totalLimit: 30,
        resetTimeMs: Date.now() + 15000,
        retryAfterSeconds: 15,
      })

      const formData = new FormData()
      formData.set("reportType", "student_profile")
      formData.set("title", "Profile Export")

      const result = await requestReportJobActionState(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("RATE_LIMITED")
        expect(result.message).toContain("15 วินาที")
      }
    })
  })

  describe("processReportJobAction", () => {
    it("returns ok with null data if no queued jobs", async () => {
      vi.mocked(processReportJobById).mockResolvedValueOnce(null)

      const result = await processReportJobAction("job-empty")
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toBeNull()
      }
    })

    it("returns ok with downloadUrl when report completed", async () => {
      vi.mocked(processReportJobById).mockResolvedValueOnce({
        id: "job-1",
        status: "completed",
        downloadUrl: "https://example.com/doc.pdf",
        errorMessage: null,
      })

      const result = await processReportJobAction("job-1")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("job-1")
        expect(result.data.status).toBe("completed")
        expect(result.data.downloadUrl).toBe("https://example.com/doc.pdf")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/reports")
    })

    it("returns actionFail if status is failed", async () => {
      vi.mocked(processReportJobById).mockResolvedValueOnce({
        id: "job-1",
        status: "failed",
        errorMessage: "Out of memory",
        downloadUrl: null,
      })

      const result = await processReportJobAction("job-1")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("INTERNAL_ERROR")
        expect(result.message).toBe("Out of memory")
      }
    })
  })

  describe("retryReportJobAction", () => {
    it("returns CONFLICT if job cannot be retried", async () => {
      vi.mocked(retryReportJob).mockResolvedValueOnce(false)

      const result = await retryReportJobAction("job-done")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("CONFLICT")
      }
    })

    it("retries report job and triggers background processor", async () => {
      vi.mocked(retryReportJob).mockResolvedValueOnce(true)
      vi.mocked(processReportJobById).mockResolvedValueOnce({
        id: "job-failed",
        status: "completed",
        downloadUrl: "https://example.com/retry.pdf",
        errorMessage: null,
      })

      const result = await retryReportJobAction("job-failed")
      expect(result.ok).toBe(true)
      expect(after).toHaveBeenCalled()
      expect(processReportJobById).toHaveBeenCalledWith("job-failed")
      expect(revalidatePath).toHaveBeenCalledWith("/reports")
    })
  })

  describe("deleteReportJobAction", () => {
    it("deletes report job and revalidates /reports", async () => {
      vi.mocked(deleteReportJob).mockResolvedValueOnce({ success: true })

      const result = await deleteReportJobAction("job-1")
      expect(result.ok).toBe(true)
      expect(deleteReportJob).toHaveBeenCalledWith("job-1")
      expect(revalidatePath).toHaveBeenCalledWith("/reports")
    })

    it("returns FORBIDDEN if delete throws FORBIDDEN", async () => {
      vi.mocked(deleteReportJob).mockRejectedValueOnce(new Error("FORBIDDEN"))

      const result = await deleteReportJobAction("job-1")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("returns descriptive error if storage delete fails", async () => {
      vi.mocked(deleteReportJob).mockRejectedValueOnce(new Error("STORAGE_DELETE_FAILED"))

      const result = await deleteReportJobAction("job-1")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("INTERNAL_ERROR")
        expect(result.message).toContain("ไม่สามารถลบไฟล์รายงานจากพื้นที่จัดเก็บได้")
      }
    })
  })
})
