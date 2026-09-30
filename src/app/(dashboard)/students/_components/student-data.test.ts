import { describe, it, expect } from "vitest"

import {
  createClassSummary,
  createStudentFilterOptions,
  createStudentPageHref,
  filterStudentRows,
  toStudentListItem,
  type StudentFilterState,
  type StudentListItem,
} from "./student-data"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"

const emptyFilters: StudentFilterState = { q: "", grade: "", classroom: "", status: "" }

function mockStudent(overrides: Partial<StudentListItem> = {}): StudentListItem {
  return {
    id: "s-1",
    name: "เด็กชาย มานะ ใจดี",
    studentCode: "STD001",
    grade: "อ.1",
    gradeLevel: "k1",
    classroom: "1",
    classroomName: "อนุบาล 1/1",
    section: 1,
    studentNumber: 1,
    status: "normal",
    statusLabel: "ปกติ",
    riskLevel: "normal",
    riskScore: 0,
    guardian: "นายสมชาย ใจดี",
    phone: "0812345678",
    avatarUrl: "",
    attendanceRate30d: 95,
    absentDays30d: 1,
    lateDays30d: 0,
    openActionCount: 0,
    openSupportCount: 0,
    activePlanCount: 0,
    activeFlagCount: 0,
    nextDueDate: null,
    priorityScore: 0,
    ...overrides,
  }
}

describe("createStudentPageHref", () => {
  it("returns /students for empty filters on page 1", () => {
    expect(createStudentPageHref(emptyFilters)(1)).toBe("/students")
  })

  it("omits the page param on page 1 but keeps filters", () => {
    const href = createStudentPageHref({ ...emptyFilters, status: "high" })(1)
    expect(href).toBe("/students?status=high")
  })

  it("preserves every filter and appends page for later pages", () => {
    const href = createStudentPageHref({
      q: "สมชาย",
      grade: "p4",
      classroom: "1",
      status: "watch",
    })(3)
    expect(href).toContain("status=watch")
    expect(href).toContain("grade=p4")
    expect(href).toContain("page=3")
    expect(href.startsWith("/students?")).toBe(true)
  })
})

describe("toStudentListItem", () => {
  it("infers gradeLevel and section from classroomName when gradeLevel is null", () => {
    const raw: StudentWorklistItem = {
      studentId: "s-100",
      studentCode: "K100",
      fullName: "ด.ช. ทดสอบ",
      photoUrl: null,
      classroomId: null,
      classroomName: "อนุบาล 2/1",
      gradeLevel: null,
      section: null,
      studentNumber: null,
      primaryGuardianName: null,
      primaryGuardianPhone: null,
      riskLevel: "normal",
      riskScore: 0,
      riskTrend: null,
      openSupportCount: 0,
      activePlanCount: 0,
      openActionCount: 0,
      activeFlagCount: 0,
      nextDueDate: null,
      absentDays30d: 0,
      lateDays30d: 0,
      recordedDays30d: 0,
      attendanceRate30d: null,
      priorityScore: 0,
    }

    const item = toStudentListItem(raw)
    expect(item.gradeLevel).toBe("k2")
    expect(item.section).toBe(1)
    expect(item.grade).toBe("อ.2")
  })
})

describe("createClassSummary", () => {
  it("orders Kindergarten first before Primary grades", () => {
    const students = [
      mockStudent({ id: "1", gradeLevel: "p6", grade: "ป.6" }),
      mockStudent({ id: "2", gradeLevel: "k1", grade: "อ.1" }),
      mockStudent({ id: "3", gradeLevel: "p1", grade: "ป.1" }),
      mockStudent({ id: "4", gradeLevel: "k3", grade: "อ.3" }),
      mockStudent({ id: "5", gradeLevel: "k2", grade: "อ.2" }),
    ]

    const summary = createClassSummary(students)
    expect(summary.map((s) => s.gradeLevel)).toEqual(["k1", "k2", "k3", "p1", "p6"])
  })
})

describe("createStudentFilterOptions", () => {
  it("generates full Thai labels and sorts Kindergarten 1-3 before Primary", () => {
    const students = [
      mockStudent({ id: "1", gradeLevel: "p1", classroomName: "ป.1/1", section: 1 }),
      mockStudent({ id: "2", gradeLevel: "k3", classroomName: "อนุบาล 3/1", section: 1 }),
      mockStudent({ id: "3", gradeLevel: "k1", classroomName: "อนุบาล 1/1", section: 1 }),
      mockStudent({ id: "4", gradeLevel: "k2", classroomName: "อนุบาล 2/1", section: 1 }),
    ]

    const options = createStudentFilterOptions(students)

    // Grade options
    expect(options.grades.map((g) => g.value)).toEqual(["k1", "k2", "k3", "p1"])
    expect(options.grades.find((g) => g.value === "k1")?.label).toBe("อนุบาล 1 (อ.1)")
    expect(options.grades.find((g) => g.value === "k2")?.label).toBe("อนุบาล 2 (อ.2)")
    expect(options.grades.find((g) => g.value === "k3")?.label).toBe("อนุบาล 3 (อ.3)")
    expect(options.grades.find((g) => g.value === "p1")?.label).toBe("ประถมศึกษาปีที่ 1 (ป.1)")

    // Does not include secondary grades because none exist in data
    expect(options.grades.some((g) => g.value.startsWith("m"))).toBe(false)

    // Classrooms are distinct and sorted by educational hierarchy
    expect(options.classrooms.map((c) => c.label)).toEqual([
      "อนุบาล 1/1",
      "อนุบาล 2/1",
      "อนุบาล 3/1",
      "ป.1/1",
    ])
  })

  it("merges schoolClassrooms even if no students are yet enrolled in them", () => {
    const students: StudentListItem[] = []
    const schoolClassrooms = [
      { id: "c1", name: "อนุบาล 1/1", gradeLevel: "k1", section: 1 },
      { id: "c2", name: "อนุบาล 2/1", gradeLevel: "k2", section: 1 },
      { id: "c3", name: "ประถมศึกษาปีที่ 1/1", gradeLevel: "p1", section: 1 },
    ]

    const options = createStudentFilterOptions(students, schoolClassrooms)
    expect(options.grades.map((g) => g.value)).toEqual(["k1", "k2", "p1"])
    expect(options.classrooms.map((c) => c.label)).toEqual([
      "อนุบาล 1/1",
      "อนุบาล 2/1",
      "ประถมศึกษาปีที่ 1/1",
    ])
  })
})

describe("filterStudentRows", () => {
  const students = [
    mockStudent({
      id: "1",
      name: "ด.ช. ก ไก่",
      gradeLevel: "k1",
      classroomName: "อนุบาล 1/1",
      section: 1,
      riskLevel: "normal",
    }),
    mockStudent({
      id: "2",
      name: "ด.ญ. ข ไข่",
      gradeLevel: "k2",
      classroomName: "อนุบาล 2/1",
      section: 1,
      riskLevel: "watch",
    }),
    mockStudent({
      id: "3",
      name: "ด.ช. ค ควาย",
      gradeLevel: "p1",
      classroomName: "ป.1/1",
      section: 1,
      riskLevel: "high",
    }),
  ]

  it("filters by grade correctly", () => {
    const filtered = filterStudentRows(students, { ...emptyFilters, grade: "k1" })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe("1")
  })

  it("filters by classroom using full classroom name", () => {
    const filtered = filterStudentRows(students, {
      ...emptyFilters,
      classroom: "อนุบาล 2/1",
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe("2")
  })

  it("filters by formatted classroom shorthand", () => {
    const filtered = filterStudentRows(students, {
      ...emptyFilters,
      classroom: "k1/1",
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe("1")
  })

  it("filters by status correctly", () => {
    const filtered = filterStudentRows(students, { ...emptyFilters, status: "high" })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe("3")
  })
})
