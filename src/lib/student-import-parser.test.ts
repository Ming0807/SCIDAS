import { describe, it, expect } from "vitest"
import {
  parseCsvContent,
  parseAndValidateStudentRows,
  generateStudentImportTemplateCsv,
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

  describe("parseAndValidateStudentRows", () => {
    it("should fail when header is missing required columns", () => {
      const csv = "ชื่อเล่น,เบอร์โทร\nกอล์ฟ,0812345678"
      const res = parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(0)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors[0]).toContain("ไม่พบคอลัมน์บังคับ")
    })

    it("should parse valid student rows and normalize Thai dates & genders", () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด,เลขบัตรประชาชน\nSTD1001,สมชาย,ใจดี,ชาย,15/05/2556,1100500123456`
      const res = parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(0)
      expect(res.validRows[0].studentCode).toBe("STD1001")
      expect(res.validRows[0].firstName).toBe("สมชาย")
      expect(res.validRows[0].lastName).toBe("ใจดี")
      expect(res.validRows[0].gender).toBe("male")
      expect(res.validRows[0].dateOfBirth).toBe("2013-05-15") // 2556 - 543 = 2013
      expect(res.validRows[0].nationalId).toBe("1100500123456")
    })

    it("should detect duplicate student codes within the batch", () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด\nSTD1001,สมชาย,ใจดี,ชาย,2013-05-15\nSTD1001,สมหญิง,ดีใจ,หญิง,2013-06-20`
      const res = parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors.some((e) => e.includes("ซ้ำกับแถวอื่น"))).toBe(true)
    })

    it("should detect invalid national ID length", () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด,เลขบัตรประชาชน\nSTD1001,สมชาย,ใจดี,ชาย,2013-05-15,12345`
      const res = parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(0)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors.some((e) => e.includes("13 หลัก"))).toBe(true)
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
