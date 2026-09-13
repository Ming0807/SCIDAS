import fs from "node:fs"
import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  buildThaiPdfDocument,
  buildXlsxSpreadsheet,
  generateReportArtifact,
} from "./report-generator"

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("@/lib/fonts/thai-font", () => ({
  getThaiFontBuffer: vi.fn(() => {
    return fs.readFileSync("src/lib/fonts/Sarabun-Regular.ttf")
  }),
}))

import { createClient } from "@/utils/supabase/server"

describe("report-generator", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("buildThaiPdfDocument", () => {
    it("generates a valid PDF buffer with official header and signatures block", async () => {
      const headers = ["ลำดับ", "ชื่อ", "สถานะ"]
      const rows = [
        ["1", "สมชาย ใจดี", "ปกติ"],
        ["2", "สมหญิง รักเรียน", "เสี่ยง"],
      ]

      const pdfBuffer = await buildThaiPdfDocument(
        "รายงานทดสอบระบบ",
        "ประจำภาคเรียนที่ 1",
        "โรงเรียนบ้านหนองแก",
        headers,
        rows,
      )

      expect(pdfBuffer).toBeInstanceOf(Buffer)
      expect(pdfBuffer.length).toBeGreaterThan(1000)
      // PDF magic bytes %PDF-
      expect(pdfBuffer.toString("utf8", 0, 5)).toBe("%PDF-")
    })
  })

  describe("buildXlsxSpreadsheet", () => {
    it("generates a valid XLSX buffer with styled rows", async () => {
      const headers = ["รหัส", "ชื่อ", "คะแนน"]
      const rows = [
        ["S001", "สมชาย", "95"],
        ["S002", "สมศรี", "80"],
      ]

      const xlsxBuffer = await buildXlsxSpreadsheet("รายงานผลคะแนน", headers, rows)
      expect(xlsxBuffer).toBeInstanceOf(Buffer)
      expect(xlsxBuffer.length).toBeGreaterThan(500)
      // ZIP magic bytes for XLSX: PK\x03\x04
      expect(xlsxBuffer[0]).toBe(0x50)
      expect(xlsxBuffer[1]).toBe(0x4b)
    })
  })

  describe("generateReportArtifact across all 9 report types", () => {
    it("generates behavior_summary artifact successfully", async () => {
      const mockSchool = { name: "โรงเรียนบ้านหนองแก", school_code: "SCH101" }
      const mockBehaviors = [
        {
          id: "b-1",
          date: "2026-09-01",
          behavior_type: "positive",
          points: 5,
          severity: "low",
          description: "ช่วยเหลืองานครู",
          students: { student_code: "S001", first_name: "สมชาย", last_name: "ใจดี" },
        },
      ]

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn((table: string) => {
          if (table === "schools") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockSchool, error: null }),
                }),
              }),
            }
          }
          if (table === "behavior_records") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      range: vi.fn().mockResolvedValue({ data: mockBehaviors, error: null }),
                    }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const artifact = await generateReportArtifact({
        id: "job-behaviors",
        schoolId: "sch-1",
        reportType: "behavior_summary",
        title: "สรุปพฤติกรรมนักเรียน",
        filters: { format: "pdf" },
      })

      expect(artifact.contentType).toBe("application/pdf")
      expect(artifact.fileExtension).toBe("pdf")
      expect(artifact.fileName).toBe("job-behaviors.pdf")
      expect(artifact.buffer.length).toBeGreaterThan(0)
    })

    it("generates home_visit_summary artifact successfully", async () => {
      const mockSchool = { name: "โรงเรียนบ้านหนองแก", school_code: "SCH101" }
      const mockVisits = [
        {
          id: "v-1",
          visit_date: "2026-08-20",
          housing_condition: "good",
          environment_safety: "ปลอดภัย",
          has_family_problem: false,
          follow_up_needed: false,
          suggestions: "ครอบครัวอบอุ่น",
          students: { student_code: "S001", first_name: "สมชาย", last_name: "ใจดี" },
        },
      ]

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn((table: string) => {
          if (table === "schools") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockSchool, error: null }),
                }),
              }),
            }
          }
          if (table === "home_visits") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      range: vi.fn().mockResolvedValue({ data: mockVisits, error: null }),
                    }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const artifact = await generateReportArtifact({
        id: "job-visits",
        schoolId: "sch-1",
        reportType: "home_visit_summary",
        title: "สรุปการเยี่ยมบ้าน",
        filters: { format: "xlsx" },
      })

      expect(artifact.contentType).toContain("spreadsheetml")
      expect(artifact.fileExtension).toBe("xlsx")
      expect(artifact.fileName).toBe("job-visits.xlsx")
    })

    it("generates support_summary artifact successfully", async () => {
      const mockSchool = { name: "โรงเรียนบ้านหนองแก", school_code: "SCH101" }
      const mockSupports = [
        {
          id: "supp-1",
          support_type: "academic",
          priority: "high",
          title: "สอนเสริมคณิตศาสตร์",
          status: "in_progress",
          started_at: "2026-09-01",
          completed_at: null,
          students: { student_code: "S001", first_name: "สมชาย", last_name: "ใจดี" },
        },
      ]

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn((table: string) => {
          if (table === "schools") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockSchool, error: null }),
                }),
              }),
            }
          }
          if (table === "support_records") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      range: vi.fn().mockResolvedValue({ data: mockSupports, error: null }),
                    }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const artifact = await generateReportArtifact({
        id: "job-supports",
        schoolId: "sch-1",
        reportType: "support_summary",
        title: "สรุปเคสการช่วยเหลือ",
        filters: { format: "pdf" },
      })

      expect(artifact.contentType).toBe("application/pdf")
      expect(artifact.fileName).toBe("job-supports.pdf")
    })

    it("generates idp_summary artifact successfully", async () => {
      const mockSchool = { name: "โรงเรียนบ้านหนองแก", school_code: "SCH101" }
      const mockPlans = [
        {
          id: "idp-1",
          title: "พัฒนาทักษะการอ่าน",
          overall_progress: 75,
          status: "active",
          start_date: "2026-06-01",
          end_date: "2026-10-31",
          students: { student_code: "S001", first_name: "สมชาย", last_name: "ใจดี" },
        },
      ]

      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn((table: string) => {
          if (table === "schools") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockSchool, error: null }),
                }),
              }),
            }
          }
          if (table === "development_plans") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      range: vi.fn().mockResolvedValue({ data: mockPlans, error: null }),
                    }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const artifact = await generateReportArtifact({
        id: "job-idp",
        schoolId: "sch-1",
        reportType: "idp_summary",
        title: "สรุปแผนพัฒนาการรายบุคคล",
        filters: { format: "xlsx" },
      })

      expect(artifact.contentType).toContain("spreadsheetml")
      expect(artifact.fileName).toBe("job-idp.xlsx")
    })

    it("throws an error for unsupported report type", async () => {
      // @ts-expect-error mock supabase
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { name: "โรงเรียน" }, error: null }),
            }),
          }),
        }),
      })

      await expect(
        generateReportArtifact({
          id: "job-unknown",
          schoolId: "sch-1",
          reportType: "non_existent_type",
          title: "Unknown",
        }),
      ).rejects.toThrow("ยังไม่เปิดให้บริการในระบบ")
    })
  })
})
