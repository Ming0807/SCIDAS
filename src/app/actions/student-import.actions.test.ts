import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  parseStudentFileAction,
  executeStudentImportAction,
  getStudentImportTemplateAction,
} from "./student-import.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/lib/student-import-parser", () => ({
  generateStudentImportTemplateCsv: vi.fn(() => "studentCode,firstName,lastName"),
  generateStudentImportTemplateXlsx: vi.fn(async () => Buffer.from("mock-xlsx-bytes")),
  parseAndValidateStudentRows: vi.fn(),
}))

vi.mock("@/lib/server/student-import-service", () => ({
  executeStudentImportRpc: vi.fn(),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import {
  parseAndValidateStudentRows,
  generateStudentImportTemplateCsv,
  generateStudentImportTemplateXlsx,
  type ParsedStudentRow,
} from "@/lib/student-import-parser"
import { executeStudentImportRpc } from "@/lib/server/student-import-service"
import { revalidatePath } from "next/cache"

const validUuid1 = "123e4567-e89b-12d3-a456-426614174000"
const validUuid2 = "123e4567-e89b-12d3-a456-426614174001"

const sampleStudent: ParsedStudentRow = {
  rowNumber: 1,
  studentCode: "S001",
  firstName: "Somchai",
  lastName: "Jaidee",
  gender: "male",
  dateOfBirth: "2010-01-01",
}

describe("student-import.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("parseStudentFileAction", () => {
    it("fails with FORBIDDEN if role is not allowed (e.g. student)", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: "prof-1",
        studentId: "stu-1",
      })

      const formData = new FormData()
      const file = new File(["dummy"], "students.csv", { type: "text/csv" })
      formData.set("file", file)

      const result = await parseStudentFileAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if file is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      const result = await parseStudentFileAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("fails with VALIDATION_ERROR if file extension is unsupported", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const formData = new FormData()
      const file = new File(["dummy"], "students.pdf", { type: "application/pdf" })
      formData.set("file", file)

      const result = await parseStudentFileAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("เฉพาะไฟล์นามสกุล .csv และ .xlsx")
      }
    })

    it("parses valid CSV file successfully", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      vi.mocked(parseAndValidateStudentRows).mockResolvedValueOnce({
        validRows: [sampleStudent],
        invalidRows: [],
        totalRows: 1,
        summary: { validCount: 1, invalidCount: 0 },
      })

      const formData = new FormData()
      const file = new File(["studentCode,firstName,lastName\nS001,Somchai,Jaidee"], "students.csv", {
        type: "text/csv",
      })
      formData.set("file", file)

      const result = await parseStudentFileAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.totalRows).toBe(1)
        expect(result.data.validRows).toHaveLength(1)
      }
    })
  })

  describe("executeStudentImportAction", () => {
    it("fails with FORBIDDEN if user role is not allowed", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: "prof-1",
        studentId: "stu-1",
      })

      const result = await executeStudentImportAction(validUuid1, validUuid2, [])
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("fails with VALIDATION_ERROR if classroomId or semesterId is invalid", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await executeStudentImportAction("invalid-id", validUuid2, [sampleStudent])
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("fails with VALIDATION_ERROR if student array is empty", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await executeStudentImportAction(validUuid1, validUuid2, [])
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("fails with VALIDATION_ERROR if duplicate student codes exist in batch", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const duplicateStudents: ParsedStudentRow[] = [
        {
          rowNumber: 1,
          studentCode: "S001",
          firstName: "Somchai",
          lastName: "Jaidee",
          gender: "male",
          dateOfBirth: "2010-01-01",
        },
        {
          rowNumber: 2,
          studentCode: "S001",
          firstName: "Somsri",
          lastName: "Jaidee",
          gender: "female",
          dateOfBirth: "2010-02-02",
        },
      ]

      const result = await executeStudentImportAction(validUuid1, validUuid2, duplicateStudents)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("executes import successfully via RPC and triggers revalidations", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      vi.mocked(executeStudentImportRpc).mockResolvedValueOnce({
        success: true,
        count: 1,
      })

      const students: ParsedStudentRow[] = [sampleStudent]

      const result = await executeStudentImportAction(validUuid1, validUuid2, students)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.count).toBe(1)
      }

      expect(executeStudentImportRpc).toHaveBeenCalledWith(validUuid1, validUuid2, students)
      expect(revalidatePath).toHaveBeenCalledWith("/students")
      expect(revalidatePath).toHaveBeenCalledWith("/attendance")
      expect(revalidatePath).toHaveBeenCalledWith("/academics")
      expect(revalidatePath).toHaveBeenCalledWith("/settings/academic")
      expect(revalidatePath).toHaveBeenCalledWith("/")
    })
  })

  describe("getStudentImportTemplateAction", () => {
    it("returns base64 CSV template", async () => {
      const result = await getStudentImportTemplateAction("csv")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.fileName).toBe("student_import_template.csv")
        expect(result.data.contentType).toContain("text/csv")
        expect(result.data.contentBase64).toBeDefined()
      }
      expect(generateStudentImportTemplateCsv).toHaveBeenCalled()
    })

    it("returns base64 XLSX template", async () => {
      const result = await getStudentImportTemplateAction("xlsx")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.fileName).toBe("student_import_template.xlsx")
        expect(result.data.contentType).toContain("spreadsheetml")
        expect(result.data.contentBase64).toBeDefined()
      }
      expect(generateStudentImportTemplateXlsx).toHaveBeenCalled()
    })
  })
})
