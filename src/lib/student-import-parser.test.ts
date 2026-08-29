import { describe, it, expect } from "vitest"
import {
  parseCsvContent,
  parseXlsxContent,
  parseAndValidateStudentRows,
  generateStudentImportTemplateCsv,
  generateStudentImportTemplateXlsx,
} from "./student-import-parser"

describe("Student Import Parser", () => {
  describe("parseCsvContent", () => {
    it("should parse standard comma-separated lines", () => {
      const csv = "a,b,c\n1,2,3"
      const result = parseCsvContent(csv)
      expect(result).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"],
      ])
    })

    it("should handle double quotes and escaped quotes inside fields", () => {
      const csv = 'name,address\n"Somchai","123/4, Village ""Green"""'
      const result = parseCsvContent(csv)
      expect(result).toEqual([
        ["name", "address"],
        ["Somchai", '123/4, Village "Green"'],
      ])
    })

    it("should handle newlines within quoted fields", () => {
      const csv = 'id,address\n1,"Line 1\nLine 2"'
      const result = parseCsvContent(csv)
      expect(result).toEqual([
        ["id", "address"],
        ["1", "Line 1\nLine 2"],
      ])
    })

    it("should strip UTF-8 BOM prefix", () => {
      const csv = "\uFEFFcode,name\nSTD001,Somchai"
      const result = parseCsvContent(csv)
      expect(result[0][0]).toBe("code")
    })
  })

  describe("parseXlsxContent and generateStudentImportTemplateXlsx", () => {
    it("should generate a valid XLSX buffer and parse it correctly", async () => {
      const xlsxBuffer = await generateStudentImportTemplateXlsx()
      expect(Buffer.isBuffer(xlsxBuffer)).toBe(true)

      const parsedTable = await parseXlsxContent(xlsxBuffer)
      expect(parsedTable.length).toBeGreaterThan(2)
      expect(parsedTable[0]).toContain("รหัสนักเรียน")
      expect(parsedTable[0]).toContain("ชื่อ")
      expect(parsedTable[0]).toContain("นามสกุล")

      // Validate through master parser with Buffer
      const res = await parseAndValidateStudentRows(xlsxBuffer, "template.xlsx")
      expect(res.validRows.length).toBe(2)
      expect(res.invalidRows.length).toBe(0)
      expect(res.validRows[0].studentCode).toBe("STD1001")
      expect(res.validRows[0].guardianPhone).toBe("0812345678")
      expect(res.validRows[0].guardianRelation).toBe("father")
    })
  })

  describe("parseAndValidateStudentRows", () => {
    it("should fail when header is missing required columns", async () => {
      const csv = "ชื่อเล่น,เบอร์โทร\nกอล์ฟ,0812345678"
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(0)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors[0]).toContain("ไม่พบคอลัมน์บังคับ")
    })

    it("should parse valid student rows and normalize Thai dates & genders", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด,เลขบัตรประชาชน,เบอร์โทรผู้ปกครอง\nSTD1001,สมชาย,ใจดี,ชาย,15/05/2556,1100500123456,0812345678`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(0)
      expect(res.validRows[0].studentCode).toBe("STD1001")
      expect(res.validRows[0].firstName).toBe("สมชาย")
      expect(res.validRows[0].lastName).toBe("ใจดี")
      expect(res.validRows[0].gender).toBe("male")
      expect(res.validRows[0].dateOfBirth).toBe("2013-05-15") // 2556 - 543 = 2013
      expect(res.validRows[0].nationalId).toBe("1100500123456")
      expect(res.validRows[0].guardianPhone).toBe("0812345678")
    })

    it("should detect duplicate student codes within the batch", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด\nSTD1001,สมชาย,ใจดี,ชาย,2013-05-15\nSTD1001,สมหญิง,ดีใจ,หญิง,2013-06-20`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors.some((e) => e.includes("ซ้ำกับแถวอื่น"))).toBe(true)
    })

    it("should reject student row when date of birth is missing", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ\nSTD1001,สมชาย,ใจดี,ชาย`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(0)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors.some((e) => e.includes("วันเกิด"))).toBe(true)
    })

    it("should reject student row when date of birth is invalid text", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด\nSTD1001,สมชาย,ใจดี,ชาย,วันจันทร์ที่แล้ว`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(0)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors.some((e) => e.includes("วันเกิด"))).toBe(true)
    })

    it("should reject file exceeding 500 rows", async () => {
      const header = "รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด\n"
      const rows = Array.from({ length: 501 }, (_, i) => `STD${1000 + i},สมชาย,ใจดี,ชาย,2013-05-15`).join("\n")
      const res = await parseAndValidateStudentRows(header + rows)
      expect(res.validRows.length).toBe(0)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors.some((e) => e.includes("สูงสุด 500"))).toBe(true)
    })

    it("should reject malicious non-XLSX payload masquerading with .xlsx filename", async () => {
      const fakeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00", "binary") // PE/EXE header
      const res = await parseAndValidateStudentRows(fakeBuffer, "exploit.xlsx")
      expect(res.validRows.length).toBe(0)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors.some((e) => e.includes("ไฟล์ XLSX ไม่ถูกต้อง"))).toBe(true)
    })
  })

  describe("generateStudentImportTemplateCsv", () => {
    it("should generate a valid CSV string starting with UTF-8 BOM", () => {
      const template = generateStudentImportTemplateCsv()
      expect(template.charCodeAt(0)).toBe(0xfeff)
      expect(template).toContain("รหัสนักเรียน")
      expect(template).toContain("เลขประจำตัวประชาชน")
      expect(template).toContain("ชื่อ")
      expect(template).toContain("นามสกุล")
    })
  })
})
