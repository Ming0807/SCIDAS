import { describe, it, expect } from "vitest"

import { createStudentPageHref, type StudentFilterState } from "./student-data"

const emptyFilters: StudentFilterState = { q: "", grade: "", classroom: "", status: "" }

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
