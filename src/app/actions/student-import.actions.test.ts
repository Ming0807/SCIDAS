import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  parseStudentFileAction,
  executeStudentImportAction,
  getStudentImportTemplateAction,
  parseAllStudentGroupsAction,
  quickCreateClassroomAction,
  executeBatchStudentImportAction,
} from "./student-import.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("@/lib/student-import-parser", () => ({
  generateStudentImportTemplateCsv: vi.fn(() => "studentCode,firstName,lastName"),
  generateStudentImportTemplateXlsx: vi.fn(async () => Buffer.from("mock-xlsx-bytes")),
  parseAndValidateStudentRows: vi.fn(),
  parseAndValidateAllGroups: vi.fn(),
}))

vi.mock("@/lib/server/student-import-service", () => ({
  executeStudentImportRpc: vi.fn(),
  findExistingStudentsInSchool: vi.fn(async () => new Map()),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import {
  parseAndValidateStudentRows,
  parseAndValidateAllGroups,
  generateStudentImportTemplateCsv,
  generateStudentImportTemplateXlsx,
  type ParsedStudentRow,
} from "@/lib/student-import-parser"
import { executeStudentImportRpc, findExistingStudentsInSchool } from "@/lib/server/student-import-service"
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
        skippedCount: 0,
        enrolledExistingCount: 0,
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

    it("allows skipping duplicate student codes when duplicateMode is 'skip'", async () => {
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
        skippedCount: 1,
        enrolledExistingCount: 0,
      })

      const duplicateStudents: ParsedStudentRow[] = [
        sampleStudent,
        { ...sampleStudent, rowNumber: 2, firstName: "Different" },
      ]

      const result = await executeStudentImportAction(
        validUuid1,
        validUuid2,
        duplicateStudents,
        "skip",
      )
      expect(result.ok).toBe(true)
      expect(executeStudentImportRpc).toHaveBeenCalledWith(
        validUuid1,
        validUuid2,
        [sampleStudent],
        "skip",
      )
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

  describe("parseAllStudentGroupsAction", () => {
    it("fails with FORBIDDEN if role is not allowed", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: "prof-1",
        studentId: "stu-1",
      })

      const formData = new FormData()
      formData.set("file", new File(["dummy"], "data.csv", { type: "text/csv" }))

      const result = await parseAllStudentGroupsAction(null, formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("parses multiple groups and annotates existing DB records", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      vi.mocked(parseAndValidateAllGroups).mockResolvedValueOnce({
        isMultiGroup: true,
        groups: [
          {
            groupId: "sheet_0_p1",
            groupName: "ป.1",
            sourceType: "sheet",
            validRows: [sampleStudent],
            invalidRows: [],
            totalRows: 1,
            inferred: { gradeLevel: "p1", section: 1, thaiName: "ประถมศึกษาปีที่ 1" },
          },
        ],
        allValidCount: 1,
        allInvalidCount: 0,
        allTotalCount: 1,
        availableSheets: ["ป.1"],
      })

      const existingMap = new Map([
        ["code:S001", { studentCode: "S001", nationalId: null, fullName: "Somchai Existing" }],
      ])
      vi.mocked(findExistingStudentsInSchool).mockResolvedValueOnce(existingMap)

      const formData = new FormData()
      formData.set("file", new File(["dummy"], "data.csv", { type: "text/csv" }))

      const result = await parseAllStudentGroupsAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.isMultiGroup).toBe(true)
        expect(result.data.groups[0].validRows[0].isExistingInDb).toBe(true)
        expect(result.data.groups[0].validRows[0].existingStudentName).toBe("Somchai Existing")
      }
    })
  })

  describe("quickCreateClassroomAction", () => {
    it("fails with FORBIDDEN if role is homeroom_teacher", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const result = await quickCreateClassroomAction({
        academicYearId: validUuid1,
        gradeLevel: "k1",
        section: 1,
        name: "อนุบาล 1/1",
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("returns existing room if already created", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
        data: { id: "room-123", name: "อนุบาล 1/1", grade_level: "k1", section: 1 },
        error: null,
      })
      const mockEq4 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 })
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

      vi.mocked(createClient).mockResolvedValueOnce({
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await quickCreateClassroomAction({
        academicYearId: validUuid1,
        gradeLevel: "k1",
        section: 1,
        name: "อนุบาล 1/1",
      })

      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("room-123")
      }
    })

    it("creates classroom when it does not exist yet", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null })
      const mockEq4 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 })
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelectQuery = vi.fn().mockReturnValue({ eq: mockEq1 })

      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { id: "new-room-456", name: "อนุบาล 1/1", grade_level: "k1", section: 1 },
        error: null,
      })
      const mockSelectInsert = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelectInsert })

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === "classrooms") {
          return {
            select: mockSelectQuery,
            insert: mockInsert,
          }
        }
        return {}
      })

      vi.mocked(createClient).mockResolvedValueOnce({
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await quickCreateClassroomAction({
        academicYearId: validUuid1,
        gradeLevel: "k1",
        section: 1,
        name: "อนุบาล 1/1",
      })

      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("new-room-456")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/students")
    })
  })

  describe("executeBatchStudentImportAction", () => {
    it("fails with FORBIDDEN if role is not allowed", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "student",
        profileId: "prof-1",
        studentId: "stu-1",
      })

      const result = await executeBatchStudentImportAction([])
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("imports multiple rooms sequentially and aggregates counts", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })

      vi.mocked(executeStudentImportRpc)
        .mockResolvedValueOnce({
          success: true,
          count: 15,
          skippedCount: 0,
          enrolledExistingCount: 0,
        })
        .mockResolvedValueOnce({
          success: true,
          count: 10,
          skippedCount: 2,
          enrolledExistingCount: 1,
        })

      const payloads = [
        {
          groupId: "g1",
          roomName: "ป.1",
          classroomId: validUuid1,
          semesterId: validUuid2,
          students: [sampleStudent],
        },
        {
          groupId: "g2",
          roomName: "ป.2",
          classroomId: validUuid1,
          semesterId: validUuid2,
          students: [{ ...sampleStudent, studentCode: "S002" }],
        },
      ]

      const result = await executeBatchStudentImportAction(payloads, "skip")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.totalRooms).toBe(2)
        expect(result.data.successRooms).toBe(2)
        expect(result.data.failedRooms).toBe(0)
        expect(result.data.totalImported).toBe(25)
        expect(result.data.totalSkipped).toBe(2)
        expect(result.data.totalEnrolledExisting).toBe(1)
        expect(result.data.roomResults).toHaveLength(2)
      }
      expect(revalidatePath).toHaveBeenCalledWith("/students")
    })
  })
})
