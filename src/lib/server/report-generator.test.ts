import { describe, it, expect } from "vitest"
import {
  buildThaiPdfDocument,
  buildXlsxSpreadsheet,
} from "./report-generator"
import { getThaiFontBuffer } from "@/lib/fonts/thai-font"

describe("Report Generator Artifact Engine", () => {
  describe("getThaiFontBuffer", () => {
    it("should load bundled Tahoma TTF font buffer without throwing", () => {
      const buffer = getThaiFontBuffer()
      expect(buffer).toBeDefined()
      expect(buffer.length).toBeGreaterThan(100000)
    })
  })

  describe("buildThaiPdfDocument", () => {
    it("should generate a multi-page valid PDF binary buffer with Thai headers and data", async () => {
      const headers = ["ลำดับ", "รหัสนักเรียน", "ชื่อ - นามสกุล", "ห้องเรียน", "สถานะ"]
      const rows = Array.from({ length: 45 }, (_, i) => [
        String(i + 1),
        `STD${1000 + i}`,
        `นายสมชาย ใจดีลำดับที่ ${i + 1}`,
        "ม.1/1",
        "ปกติ",
      ])

      const pdfBuffer = await buildThaiPdfDocument(
        "รายงานทดสอบภาษาไทย",
        "ภาคเรียนที่ 1 ปีการศึกษา 2567",
        "โรงเรียนสาธิตต้นแบบ",
        headers,
        rows
      )

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
      expect(pdfBuffer.length).toBeGreaterThan(10000)

      // Verify PDF header magic bytes "%PDF-"
      const headerString = pdfBuffer.subarray(0, 5).toString("utf8")
      expect(headerString).toBe("%PDF-")
    })
  })

  describe("buildXlsxSpreadsheet", () => {
    it("should generate a valid XLSX spreadsheet buffer with title, headers and rows", () => {
      const headers = ["รหัส", "ชื่อ", "นามสกุล", "คะแนน"]
      const rows = [
        ["STD01", "สมชาย", "ใจดี", "85"],
        ["STD02", "สมหญิง", "ดีใจ", "92"],
      ]

      const xlsxBuffer = buildXlsxSpreadsheet(
        "คะแนนสอบรายวิชา",
        headers,
        rows
      )

      expect(Buffer.isBuffer(xlsxBuffer)).toBe(true)
      expect(xlsxBuffer.length).toBeGreaterThan(1000)

      // Verify PK zip header magic bytes for OOXML spreadsheet (PK\x03\x04)
      expect(xlsxBuffer[0]).toBe(0x50)
      expect(xlsxBuffer[1]).toBe(0x4b)
      expect(xlsxBuffer[2]).toBe(0x03)
      expect(xlsxBuffer[3]).toBe(0x04)
    })
  })
})
