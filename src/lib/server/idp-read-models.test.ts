import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

import { getStudentIdsWithActivePlans } from "./idp-read-models"

const VALID_A = "11111111-1111-4111-8111-111111111111"
const VALID_B = "22222222-2222-4222-8222-222222222222"

function mockContext() {
  vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
    userId: "u1",
    schoolId: "sch-1",
    role: "homeroom_teacher",
    profileId: "p1",
    studentId: null,
  })
}

function mockPlansQuery(data: Array<{ student_id: string }> | null, error: { message: string } | null = null) {
  const mockStatusIn = vi.fn().mockResolvedValue({ data, error })
  const mockStudentIn = vi.fn().mockReturnValue({ in: mockStatusIn })
  const mockEq = vi.fn().mockReturnValue({ in: mockStudentIn })
  const mockFrom = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: mockEq }) })
  vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom } as never)
  return { mockFrom, mockEq, mockStudentIn, mockStatusIn }
}

describe("getStudentIdsWithActivePlans", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns an empty set without querying when no ids are given", async () => {
    const result = await getStudentIdsWithActivePlans([])
    expect(result).toEqual(new Set())
    expect(createClient).not.toHaveBeenCalled()
  })

  it("filters out non-UUID ids before querying", async () => {
    mockContext()
    const { mockFrom, mockStudentIn } = mockPlansQuery([{ student_id: VALID_A }])

    const result = await getStudentIdsWithActivePlans(["not-a-uuid", VALID_A, VALID_A])

    expect(mockFrom).toHaveBeenCalledWith("development_plans")
    expect(mockStudentIn).toHaveBeenCalledWith("student_id", [VALID_A])
    expect(result).toEqual(new Set([VALID_A]))
  })

  it("returns an empty set without querying when every id is invalid", async () => {
    const result = await getStudentIdsWithActivePlans(["nope"])
    expect(result).toEqual(new Set())
    expect(createClient).not.toHaveBeenCalled()
  })

  it("scopes by school and only counts draft/active plans", async () => {
    mockContext()
    const { mockEq, mockStudentIn, mockStatusIn } = mockPlansQuery([
      { student_id: VALID_A },
      { student_id: VALID_B },
    ])

    const result = await getStudentIdsWithActivePlans([VALID_A, VALID_B])

    expect(mockEq).toHaveBeenCalledWith("school_id", "sch-1")
    expect(mockStudentIn).toHaveBeenCalledWith("student_id", [VALID_A, VALID_B])
    expect(mockStatusIn).toHaveBeenCalledWith("status", ["draft", "active"])
    expect(result).toEqual(new Set([VALID_A, VALID_B]))
  })

  it("throws FORBIDDEN without an authenticated profile", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "u1",
      schoolId: "sch-1",
      role: "homeroom_teacher",
      profileId: null,
      studentId: null,
    })

    await expect(getStudentIdsWithActivePlans([VALID_A])).rejects.toThrow("FORBIDDEN")
  })

  it("surfaces database errors", async () => {
    mockContext()
    mockPlansQuery(null, { message: "db down" })

    await expect(getStudentIdsWithActivePlans([VALID_A])).rejects.toThrow("db down")
  })
})
