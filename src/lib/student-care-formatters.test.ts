import { describe, expect, it } from "vitest"

import { formatGradeLevel } from "./student-care-formatters"

describe("formatGradeLevel", () => {
  it("labels kindergarten levels in Thai", () => {
    expect(formatGradeLevel("k1")).toBe("อ.1")
    expect(formatGradeLevel("k2")).toBe("อ.2")
    expect(formatGradeLevel("k3")).toBe("อ.3")
  })

  it("labels primary and secondary levels in Thai", () => {
    expect(formatGradeLevel("p1")).toBe("ป.1")
    expect(formatGradeLevel("m6")).toBe("ม.6")
  })

  it("falls back honestly for empty or unknown codes", () => {
    expect(formatGradeLevel(null)).toBe("-")
    expect(formatGradeLevel(undefined)).toBe("-")
    expect(formatGradeLevel("xyz")).toBe("XYZ")
  })
})
