import { describe, it, expect } from "vitest"
import {
  parseCsvContent,
  parseXlsxContent,
  parseAndValidateStudentRows,
  generateStudentImportTemplateCsv,
  generateStudentImportTemplateXlsx,
  inferGradeAndSection,
  parseAndValidateAllGroups,
} from "./student-import-parser"
import * as fs from "fs"
import * as path from "path"

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

    it("should accept student row when date of birth is missing and set dateOfBirth to null", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ\nSTD1001,สมชาย,ใจดี,ชาย`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(0)
      expect(res.validRows[0].dateOfBirth).toBeNull()
    })

    it("should parse combined Thai full name into prefix, firstName, lastName, and gender", async () => {
      const csv = `เลขประจำตัว,ชื่อ-สกุล\n1305,ด.ญ.นูรฟาเตน เปาะนุ๊\n1367,ด.ช.ซุกรอน วาเยะ`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(2)
      expect(res.validRows[0].studentCode).toBe("1305")
      expect(res.validRows[0].prefix).toBe("ด.ญ.")
      expect(res.validRows[0].firstName).toBe("นูรฟาเตน")
      expect(res.validRows[0].lastName).toBe("เปาะนุ๊")
      expect(res.validRows[0].gender).toBe("female")

      expect(res.validRows[1].studentCode).toBe("1367")
      expect(res.validRows[1].prefix).toBe("ด.ช.")
      expect(res.validRows[1].firstName).toBe("ซุกรอน")
      expect(res.validRows[1].lastName).toBe("วาเยะ")
      expect(res.validRows[1].gender).toBe("male")
    })

    it("should skip empty or numbering-only rows automatically", async () => {
      const csv = `ที่,เลขประจำตัว,ชื่อ-สกุล\n1.,1305,ด.ญ.นูรฟาเตน เปาะนุ๊\n13.,,`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(0)
      expect(res.totalRows).toBe(1)
    })

    it("should allow skipping in-file duplicates when skipInFileDuplicates option is true", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล\nSTD1001,สมชาย,ใจดี\nSTD1001,สมหญิง,ดีใจ`
      const res = await parseAndValidateStudentRows(csv, "data.csv", {
        skipInFileDuplicates: true,
      })
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(0)
      expect(res.validRows[0].firstName).toBe("สมชาย")
    })

    it("should reject student row when date of birth is invalid text", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด\nSTD1001,สมชาย,ใจดี,ชาย,วันจันทร์ที่แล้ว`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(0)
      expect(res.invalidRows.length).toBe(1)
      expect(res.invalidRows[0].errors.some((e) => e.includes("วันเกิด"))).toBe(true)
    })

    it("should reject impossible calendar dates", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ,วันเกิด\nSTD1001,สมชาย,ใจดี,ชาย,31/02/2556`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows).toHaveLength(0)
      expect(res.invalidRows[0].errors.some((e) => e.includes("วันเกิด"))).toBe(true)
    })

    it("should reject unsupported legacy XLS files", async () => {
      const legacyXlsHeader = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
      const res = await parseAndValidateStudentRows(legacyXlsHeader, "legacy.xls")
      expect(res.validRows).toHaveLength(0)
      expect(res.invalidRows[0].errors.some((e) => e.includes("CSV และ XLSX"))).toBe(true)
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

  describe("inferGradeAndSection", () => {
    it("should infer kindergarten levels", () => {
      expect(inferGradeAndSection("อนุบาล 1")).toEqual({
        gradeLevel: "k1",
        section: 1,
        thaiName: "อนุบาล 1",
      })
      expect(inferGradeAndSection("อนุบาล 2/2")).toEqual({
        gradeLevel: "k2",
        section: 2,
        thaiName: "อนุบาล 2/2",
      })
      expect(inferGradeAndSection("อ.3")).toEqual({
        gradeLevel: "k3",
        section: 1,
        thaiName: "อนุบาล 3",
      })
      expect(inferGradeAndSection("K2/1")).toEqual({
        gradeLevel: "k2",
        section: 1,
        thaiName: "อนุบาล 2",
      })
    })

    it("should infer primary school levels", () => {
      expect(inferGradeAndSection("ป.1")).toEqual({
        gradeLevel: "p1",
        section: 1,
        thaiName: "ประถมศึกษาปีที่ 1",
      })
      expect(inferGradeAndSection("ป.3/2")).toEqual({
        gradeLevel: "p3",
        section: 2,
        thaiName: "ประถมศึกษาปีที่ 3/2",
      })
      expect(inferGradeAndSection("ประถมศึกษาปีที่ 6/1")).toEqual({
        gradeLevel: "p6",
        section: 1,
        thaiName: "ประถมศึกษาปีที่ 6",
      })
    })

    it("should infer secondary school levels", () => {
      expect(inferGradeAndSection("ม.1/1")).toEqual({
        gradeLevel: "m1",
        section: 1,
        thaiName: "มัธยมศึกษาปีที่ 1",
      })
      expect(inferGradeAndSection("ม.4/3")).toEqual({
        gradeLevel: "m4",
        section: 3,
        thaiName: "มัธยมศึกษาปีที่ 4/3",
      })
    })

    it("should return null for unrecognized names", () => {
      expect(inferGradeAndSection("ห้องสมุด")).toBeNull()
      expect(inferGradeAndSection("")).toBeNull()
    })
  })

  describe("parseAndValidateAllGroups", () => {
    it("should handle single CSV without classroom column as single group", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เพศ\nSTD001,สมชาย,สุขใจ,ชาย\nSTD002,สมหญิง,มีชัย,หญิง`
      const result = await parseAndValidateAllGroups(csv, "students.csv")
      expect(result.isMultiGroup).toBe(false)
      expect(result.groups).toHaveLength(1)
      expect(result.groups[0].validRows).toHaveLength(2)
      expect(result.groups[0].invalidRows).toHaveLength(0)
    })

    it("should split single CSV by classroom column when present", async () => {
      const csv = `ห้อง,รหัสนักเรียน,ชื่อ,นามสกุล,เพศ\nป.1/1,STD001,สมชาย,สุขใจ,ชาย\nป.1/2,STD002,สมหญิง,มีชัย,หญิง\nป.1/1,STD003,กิตติ,สมบูรณ์,ชาย`
      const result = await parseAndValidateAllGroups(csv, "all_students.csv")
      expect(result.isMultiGroup).toBe(true)
      expect(result.groups).toHaveLength(2)

      const g1 = result.groups.find((g) => g.groupName === "ป.1/1")
      const g2 = result.groups.find((g) => g.groupName === "ป.1/2")

      expect(g1).toBeDefined()
      expect(g1?.validRows).toHaveLength(2)
      expect(g1?.inferred?.gradeLevel).toBe("p1")
      expect(g1?.inferred?.section).toBe(1)

      expect(g2).toBeDefined()
      expect(g2?.validRows).toHaveLength(1)
      expect(g2?.inferred?.gradeLevel).toBe("p1")
      expect(g2?.inferred?.section).toBe(2)
    })

    it("should parse multi-sheet XLSX file and extract all 9 sheets", async () => {
      const filePath = path.join(process.cwd(), "data-import", "รายชื่อนักเรียน_เทอม1.xlsx")
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath)
        const result = await parseAndValidateAllGroups(buffer, "รายชื่อนักเรียน_เทอม1.xlsx")

        expect(result.isMultiGroup).toBe(true)
        expect(result.groups.length).toBe(9)
        expect(result.availableSheets).toEqual([
          "อนุบาล 1",
          "อนุบาล 2",
          "อนุบาล 3",
          "ป.1",
          "ป.2",
          "ป.3",
          "ป.4",
          "ป.5",
          "ป.6",
        ])

        // In default mode without auto-generation, K1 students lack student codes in the raw file
        const k1Group = result.groups[0]
        expect(k1Group.groupName).toBe("อนุบาล 1")
        expect(k1Group.inferred?.gradeLevel).toBe("k1")
        expect(k1Group.invalidRows.length).toBe(12)
        expect(k1Group.invalidRows[0].errors[0]).toContain("จำเป็นต้องระบุรหัสนักเรียน")

        // Primary 1 to 6 all have student codes and should be valid
        const p1Group = result.groups[3]
        expect(p1Group.groupName).toBe("ป.1")
        expect(p1Group.inferred?.gradeLevel).toBe("p1")
        expect(p1Group.validRows.length).toBe(15)

        const p6Group = result.groups[8]
        expect(p6Group.groupName).toBe("ป.6")
        expect(p6Group.inferred?.gradeLevel).toBe("p6")
        expect(p6Group.validRows.length).toBe(13)

        // When autoGenerateMissingCode is enabled, K1 rows become valid
        const resultWithAutoGen = await parseAndValidateAllGroups(buffer, "รายชื่อนักเรียน_เทอม1.xlsx", {
          autoGenerateMissingCode: true,
          allowInvalidNationalIdAsNull: false,
        })
        const k1WithGen = resultWithAutoGen.groups[0]
        expect(k1WithGen.validRows.length).toBe(12)
        expect(k1WithGen.invalidRows.length).toBe(0)
        expect(k1WithGen.validRows[0].studentCode).toMatch(/^AUTO\d+/)

        // When both autoGenerateMissingCode and allowInvalidNationalIdAsNull are enabled, all 113 students are valid
        const resultFullSmart = await parseAndValidateAllGroups(buffer, "รายชื่อนักเรียน_เทอม1.xlsx", {
          autoGenerateMissingCode: true,
          allowInvalidNationalIdAsNull: true,
        })
        expect(resultFullSmart.allValidCount).toBe(113)
        expect(resultFullSmart.allInvalidCount).toBe(0)
      }
    })

    it("should parse consolidated master sheet Excel (DMC format) into 9 classrooms with อ.1/1 to ป.6/1", async () => {
      const filePath = path.join(process.cwd(), "data-import", "นักเรียน.xlsx")
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath)
        const result = await parseAndValidateAllGroups(buffer, "นักเรียน.xlsx", {
          autoGenerateMissingCode: true,
          allowInvalidNationalIdAsNull: true,
        })

        expect(result.isMultiGroup).toBe(true)
        expect(result.groups).toHaveLength(9)
        expect(result.allValidCount).toBe(118)
        expect(result.allInvalidCount).toBe(0)

        // Verify group names and inferred levels
        const groupNames = result.groups.map((g) => g.groupName)
        expect(groupNames).toEqual([
          "อ.1/1",
          "อ.2/1",
          "อ.3/1",
          "ป.1/1",
          "ป.2/1",
          "ป.3/1",
          "ป.4/1",
          "ป.5/1",
          "ป.6/1",
        ])

        const k1 = result.groups.find((g) => g.groupName === "อ.1/1")
        expect(k1?.validRows).toHaveLength(9)
        expect(k1?.inferred?.gradeLevel).toBe("k1")
        expect(k1?.inferred?.section).toBe(1)

        const p6 = result.groups.find((g) => g.groupName === "ป.6/1")
        expect(p6?.validRows).toHaveLength(18)
        expect(p6?.inferred?.gradeLevel).toBe("p6")
        expect(p6?.inferred?.section).toBe(1)
      }
    })

    it("should auto-detect header row when row 0 is a title banner", async () => {
      const csv = `โรงเรียนบ้านหนองบัว รายชื่อนักเรียน ปีการศึกษา 2567\nที่,เลขประจำตัว,ชื่อ-สกุล,เลขประชาชน\n1.,STD901,ด.ช.มานะ ดีใจ,1100500123456`
      const res = await parseAndValidateStudentRows(csv)
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(0)
      expect(res.validRows[0].studentCode).toBe("STD901")
      expect(res.validRows[0].firstName).toBe("มานะ")
      expect(res.validRows[0].lastName).toBe("ดีใจ")
    })

    it("should allow missing studentCode header if autoGenerateMissingCode is enabled", async () => {
      const csv = `ชื่อ-สกุล,เลขประชาชน\nด.ญ.มานี มีแชร์,1100500123457`
      const res = await parseAndValidateStudentRows(csv, "data.csv", {
        autoGenerateMissingCode: true,
      })
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(0)
      expect(res.validRows[0].studentCode).toMatch(/^AUTO\d+/)
      expect(res.validRows[0].firstName).toBe("มานี")
    })

    it("should gracefully set invalid nationalId to null when allowInvalidNationalIdAsNull is enabled", async () => {
      const csv = `รหัสนักเรียน,ชื่อ,นามสกุล,เลขบัตรประชาชน\nS001,สมปอง,สุขสำราญ,12345678901234` // 14 digits
      const res = await parseAndValidateStudentRows(csv, "data.csv", {
        allowInvalidNationalIdAsNull: true,
      })
      expect(res.validRows.length).toBe(1)
      expect(res.invalidRows.length).toBe(0)
      expect(res.validRows[0].nationalId).toBeNull()
    })
  })
})

