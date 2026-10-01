import { describe, expect, it } from "vitest"
import { calculateDueStatus } from "./unified-followup-read-models"

describe("calculateDueStatus (Bangkok time zone)", () => {
  const REF_DATE = "2026-10-01"

  it("identifies past dates as overdue", () => {
    expect(calculateDueStatus("2026-09-30", REF_DATE)).toBe("overdue")
    expect(calculateDueStatus("2026-09-01", REF_DATE)).toBe("overdue")
  })

  it("identifies today date as due_today", () => {
    expect(calculateDueStatus("2026-10-01", REF_DATE)).toBe("due_today")
  })

  it("identifies dates within 7 days as due_soon", () => {
    expect(calculateDueStatus("2026-10-02", REF_DATE)).toBe("due_soon")
    expect(calculateDueStatus("2026-10-05", REF_DATE)).toBe("due_soon")
    expect(calculateDueStatus("2026-10-08", REF_DATE)).toBe("due_soon")
  })

  it("identifies dates beyond 7 days as upcoming", () => {
    expect(calculateDueStatus("2026-10-09", REF_DATE)).toBe("upcoming")
    expect(calculateDueStatus("2026-10-20", REF_DATE)).toBe("upcoming")
  })
})
