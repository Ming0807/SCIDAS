import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

import { getAcademicTrendAcrossSemesters } from "./academic-read-models"

function mockContext() {
  vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
    userId: "u1",
    schoolId: "sch-1",
    role: "homeroom_teacher",
    profileId: "p1",
    studentId: null,
  })
}

describe("getAcademicTrendAcrossSemesters", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("throws FORBIDDEN without an authenticated profile", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "u1",
      schoolId: "sch-1",
      role: "homeroom_teacher",
      profileId: null,
      studentId: null,
    })

    await expect(getAcademicTrendAcrossSemesters()).rejects.toThrow("FORBIDDEN")
  })

  it("returns per-semester GPA averages oldest-first with labels", async () => {
    mockContext()

    const semesters = [
      { id: "sem-old", semester: "semester_2", academic_years: { year: 2567 } },
      { id: "sem-new", semester: "semester_1", academic_years: [{ year: 2568 }] },
    ]
    const scores = [
      // sem-old: student A has 2 subjects (3.0 + 4.0 -> 3.5), student B has 1 (2.0)
      { semester_id: "sem-old", student_id: "stu-a", grade_point: 3.0 },
      { semester_id: "sem-old", student_id: "stu-a", grade_point: 4.0 },
      { semester_id: "sem-old", student_id: "stu-b", grade_point: 2.0 },
      // sem-new: single student single subject
      { semester_id: "sem-new", student_id: "stu-a", grade_point: 3.5 },
    ]

    const mockLimitScores = vi.fn().mockResolvedValue({ data: scores, error: null })
    const mockNot = vi.fn().mockReturnValue({ limit: mockLimitScores })
    const mockIn = vi.fn().mockReturnValue({ not: mockNot })
    const mockEqSchoolScores = vi.fn().mockReturnValue({ in: mockIn })
    const mockLimitSem = vi.fn().mockResolvedValue({ data: semesters, error: null })
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimitSem })
    const mockEqSchoolSem = vi.fn().mockReturnValue({ order: mockOrder })

    const mockFrom = vi.fn((table: string) => {
      if (table === "semesters") {
        return { select: vi.fn().mockReturnValue({ eq: mockEqSchoolSem }) }
      }
      if (table === "academic_scores") {
        return { select: vi.fn().mockReturnValue({ eq: mockEqSchoolScores }) }
      }
      return {}
    })
    vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom } as never)

    const trend = await getAcademicTrendAcrossSemesters()

    expect(trend).toHaveLength(2)
    expect(trend[0]).toMatchObject({
      semesterId: "sem-old",
      label: "ภาคเรียนที่ 2/2567",
      averageGpa: 2.75, // (3.5 + 2.0) / 2
      scoreCount: 3,
    })
    expect(trend[1]).toMatchObject({
      semesterId: "sem-new",
      label: "ภาคเรียนที่ 1/2568",
      averageGpa: 3.5,
      scoreCount: 1,
    })
    expect(mockEqSchoolSem).toHaveBeenCalledWith("school_id", "sch-1")
    expect(mockEqSchoolScores).toHaveBeenCalledWith("school_id", "sch-1")
  })

  it("marks semesters without scores as null", async () => {
    mockContext()

    const semesters = [{ id: "sem-empty", semester: "semester_1", academic_years: null }]
    const mockLimitScores = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockNot = vi.fn().mockReturnValue({ limit: mockLimitScores })
    const mockIn = vi.fn().mockReturnValue({ not: mockNot })
    const mockEqSchoolScores = vi.fn().mockReturnValue({ in: mockIn })
    const mockLimitSem = vi.fn().mockResolvedValue({ data: semesters, error: null })
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimitSem })
    const mockEqSchoolSem = vi.fn().mockReturnValue({ order: mockOrder })

    const mockFrom = vi.fn((table: string) => {
      if (table === "semesters") {
        return { select: vi.fn().mockReturnValue({ eq: mockEqSchoolSem }) }
      }
      return { select: vi.fn().mockReturnValue({ eq: mockEqSchoolScores }) }
    })
    vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom } as never)

    const trend = await getAcademicTrendAcrossSemesters()

    expect(trend).toHaveLength(1)
    expect(trend[0].averageGpa).toBeNull()
    expect(trend[0].label).toBe("ภาคเรียนที่ 1/-")
  })
})
