import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  setActionItemStatus,
  addStudentNote,
  addStudentAttachment,
} from "./care.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/student-care-read-models", () => ({
  updateActionItemStatus: vi.fn(),
  createStudentNote: vi.fn(),
  uploadStudentAttachment: vi.fn(),
}))

import {
  updateActionItemStatus,
  createStudentNote,
  uploadStudentAttachment,
} from "@/lib/server/student-care-read-models"
import { revalidatePath } from "next/cache"

describe("care.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("setActionItemStatus", () => {
    it("fails when actionItemId is missing", async () => {
      const result = await setActionItemStatus("", "done")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("Missing action item id")
      }
    })

    it("fails when status is invalid", async () => {
      // @ts-expect-error testing invalid status runtime validation
      const result = await setActionItemStatus("act-1", "invalid_status")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("Invalid action item status")
      }
    })

    it("handles UNAUTHORIZED error from server layer", async () => {
      vi.mocked(updateActionItemStatus).mockRejectedValueOnce(new Error("UNAUTHORIZED"))
      const result = await setActionItemStatus("act-1", "done")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
      }
    })

    it("handles FORBIDDEN error from server layer", async () => {
      vi.mocked(updateActionItemStatus).mockRejectedValueOnce(new Error("FORBIDDEN"))
      const result = await setActionItemStatus("act-1", "done")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("succeeds and revalidates relevant paths", async () => {
      vi.mocked(updateActionItemStatus).mockResolvedValueOnce({
        id: "act-1",
        studentId: "stu-101",
        studentName: "Somchai",
        title: "Check attendance",
        description: null,
        category: "attendance",
        priority: "high",
        status: "done",
        dueDate: null,
        assignedTo: null,
        sourceTable: "attendance_records",
        sourceId: "att-row-1",
      })

      const result = await setActionItemStatus("act-1", "done")
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("act-1")
        expect(result.data.status).toBe("done")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/")
      expect(revalidatePath).toHaveBeenCalledWith("/support")
      expect(revalidatePath).toHaveBeenCalledWith("/students/stu-101")
    })
  })

  describe("addStudentNote", () => {
    it("fails when studentId is missing", async () => {
      const formData = new FormData()
      formData.set("body", "Test note body")

      const result = await addStudentNote(formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("Missing student id")
      }
    })

    it("fails when note body is empty", async () => {
      const formData = new FormData()
      formData.set("studentId", "stu-101")
      formData.set("body", "   ")

      const result = await addStudentNote(formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.body).toBeDefined()
      }
    })

    it("succeeds when note data is valid", async () => {
      const formData = new FormData()
      formData.set("studentId", "stu-101")
      formData.set("body", "Student showed great improvement in reading.")
      formData.set("category", "academic")
      formData.set("visibility", "team")

      vi.mocked(createStudentNote).mockResolvedValueOnce({
        id: "note-1",
        studentId: "stu-101",
        authorId: "prof-1",
        authorName: "Teacher Sompong",
        authorRole: "homeroom_teacher",
        body: "Student showed great improvement in reading.",
        category: "academic",
        visibility: "team",
        pinned: false,
        sourceTable: null,
        sourceId: null,
        createdAt: "2026-09-13T00:00:00Z",
        updatedAt: "2026-09-13T00:00:00Z",
      })

      const result = await addStudentNote(formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("note-1")
        expect(result.data.studentId).toBe("stu-101")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/students/stu-101")
      expect(revalidatePath).toHaveBeenCalledWith("/support")
    })
  })

  describe("addStudentAttachment", () => {
    it("fails when studentId is missing", async () => {
      const formData = new FormData()
      formData.set("file", new File(["sample content"], "test.pdf", { type: "application/pdf" }))

      const result = await addStudentAttachment(formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.message).toContain("Missing student id")
      }
    })

    it("fails when file is missing or empty", async () => {
      const formData = new FormData()
      formData.set("studentId", "stu-101")

      const result = await addStudentAttachment(formData)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
        expect(result.fieldErrors?.file).toBeDefined()
      }
    })

    it("succeeds and revalidates home-visit detail path when referenceTable is home_visits", async () => {
      const formData = new FormData()
      formData.set("studentId", "stu-101")
      formData.set("referenceTable", "home_visits")
      formData.set("referenceId", "visit-77")
      formData.set("file", new File(["sample image"], "evidence.jpg", { type: "image/jpeg" }))

      vi.mocked(uploadStudentAttachment).mockResolvedValueOnce({
        id: "att-1",
        studentId: "stu-101",
        uploadedBy: "prof-1",
        bucket: "documents",
        storagePath: "student-attachments/stu-101/evidence.jpg",
        fileName: "evidence.jpg",
        fileSize: 1024,
        mimeType: "image/jpeg",
        referenceTable: "home_visits",
        referenceId: "visit-77",
        isPrivate: false,
        createdAt: "2026-09-13T00:00:00Z",
        updatedAt: "2026-09-13T00:00:00Z",
        downloadUrl: "https://example.com/evidence.jpg",
      })

      const result = await addStudentAttachment(formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("att-1")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/home-visits/visit-77")
      expect(revalidatePath).toHaveBeenCalledWith("/home-visits")
    })

    it("succeeds and revalidates support detail path when referenceTable is support_cases", async () => {
      const formData = new FormData()
      formData.set("studentId", "stu-101")
      formData.set("referenceTable", "support_cases")
      formData.set("referenceId", "case-88")
      formData.set("file", new File(["medical report"], "doctor.pdf", { type: "application/pdf" }))

      vi.mocked(uploadStudentAttachment).mockResolvedValueOnce({
        id: "att-2",
        studentId: "stu-101",
        uploadedBy: "prof-1",
        bucket: "documents",
        storagePath: "student-attachments/stu-101/doctor.pdf",
        fileName: "doctor.pdf",
        fileSize: 2048,
        mimeType: "application/pdf",
        referenceTable: "support_cases",
        referenceId: "case-88",
        isPrivate: false,
        createdAt: "2026-09-13T00:00:00Z",
        updatedAt: "2026-09-13T00:00:00Z",
        downloadUrl: "https://example.com/doctor.pdf",
      })

      const result = await addStudentAttachment(formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe("att-2")
      }
      expect(revalidatePath).toHaveBeenCalledWith("/support/case-88")
      expect(revalidatePath).toHaveBeenCalledWith("/support")
    })
  })
})
