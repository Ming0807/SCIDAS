import { describe, expect, it } from "vitest"

import { familyStatusLabels, familyStatusOptions, validFamilyStatuses } from "./student-constants"

describe("student-constants", () => {
  it("keeps family status codes, labels, and options in sync", () => {
    expect([...validFamilyStatuses].sort()).toEqual(Object.keys(familyStatusLabels).sort())
    expect(familyStatusOptions.map((o) => o.value).sort()).toEqual([...validFamilyStatuses].sort())
    for (const option of familyStatusOptions) {
      expect(option.label).toBe(familyStatusLabels[option.value])
    }
  })
})
