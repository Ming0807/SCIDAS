import { beforeEach, describe, expect, it, vi } from "vitest"
import { getStudentAttachments } from "./student-care-read-models"

vi.mock("./current-user", () => ({
  getCurrentUserContext: vi.fn(async () => ({
    userId: "user-1",
    profileId: "profile-1",
    schoolId: "school-1",
    role: "admin",
    classroomIds: ["c1"],
  })),
}))

const mockFrom = vi.fn()
const mockStorageFrom = vi.fn()

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
  })),
}))

describe("getStudentAttachments", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("queries student attachments without reference filters", async () => {
    const mockLimit = vi.fn().mockResolvedValue({
      data: [
        {
          id: "att-1",
          school_id: "school-1",
          student_id: "stu-1",
          file_name: "test.pdf",
          file_size: 1024,
          mime_type: "application/pdf",
          bucket: "documents",
          storage_path: "path/test.pdf",
          is_private: false,
          reference_table: null,
          reference_id: null,
          created_at: "2026-09-13T00:00:00Z",
          uploaded_by: "user-1",
        },
      ],
      error: null,
    })
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockEqStudent = vi.fn().mockReturnValue({ order: mockOrder })
    const mockEqSchool = vi.fn().mockReturnValue({ eq: mockEqStudent })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSchool })

    mockFrom.mockReturnValue({ select: mockSelect })
    mockStorageFrom.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: "https://example.com/file" } }),
    })

    const result = await getStudentAttachments("stu-1", 5)

    expect(mockFrom).toHaveBeenCalledWith("student_attachments")
    expect(mockEqSchool).toHaveBeenCalledWith("school_id", "school-1")
    expect(mockEqStudent).toHaveBeenCalledWith("student_id", "stu-1")
    expect(mockLimit).toHaveBeenCalledWith(5)
    expect(result).toHaveLength(1)
    expect(result[0].fileName).toBe("test.pdf")
    expect(result[0].downloadUrl).toBe("https://example.com/file")
  })

  it("applies referenceTable and referenceId filters when provided", async () => {
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockEqRefId = vi.fn().mockReturnValue({ order: mockOrder })
    const mockEqRefTable = vi.fn().mockReturnValue({ eq: mockEqRefId })
    const mockEqStudent = vi.fn().mockReturnValue({ eq: mockEqRefTable })
    const mockEqSchool = vi.fn().mockReturnValue({ eq: mockEqStudent })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSchool })

    mockFrom.mockReturnValue({ select: mockSelect })

    await getStudentAttachments("stu-1", 10, {
      referenceTable: "home_visits",
      referenceId: "hv-123",
    })

    expect(mockEqRefTable).toHaveBeenCalledWith("reference_table", "home_visits")
    expect(mockEqRefId).toHaveBeenCalledWith("reference_id", "hv-123")
  })
})
