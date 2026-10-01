import { describe, it, expect } from "vitest"
import {
  calculateReferralSla,
  REFERRAL_AGENCY_DIRECTORY,
} from "./referral-constants"

describe("referral-constants & SLA", () => {
  it("provides comprehensive internal and external agency directory entries", () => {
    const internal = REFERRAL_AGENCY_DIRECTORY.filter((a) => a.type === "internal")
    const external = REFERRAL_AGENCY_DIRECTORY.filter((a) => a.type === "external")

    expect(internal.length).toBeGreaterThanOrEqual(4)
    expect(external.length).toBeGreaterThanOrEqual(5)

    const hotlines = REFERRAL_AGENCY_DIRECTORY.filter((a) => Boolean(a.hotline))
    expect(hotlines.length).toBeGreaterThanOrEqual(2)
  })

  it("calculates SLA on-track for recent referral", () => {
    const now = new Date("2026-10-10T12:00:00Z")
    const created = new Date("2026-10-08T12:00:00Z") // 2 days elapsed

    const res = calculateReferralSla(created, "medium", "in_progress", now)
    expect(res.isOverdue).toBe(false)
    expect(res.status).toBe("on_track")
    expect(res.elapsedDays).toBe(2)
    expect(res.slaTargetDays).toBe(14)
    expect(res.label).toContain("เหลือ SLA 12 วัน")
  })

  it("calculates SLA warning when close to deadline (<= 2 days left)", () => {
    const now = new Date("2026-10-13T12:00:00Z")
    const created = new Date("2026-10-01T12:00:00Z") // 12 days elapsed, 2 days left

    const res = calculateReferralSla(created, "medium", "pending", now)
    expect(res.isOverdue).toBe(false)
    expect(res.status).toBe("warning")
    expect(res.tone).toBe("watch")
    expect(res.label).toContain("เหลือ SLA 2 วัน")
  })

  it("flags overdue when critical referral exceeds 2 days", () => {
    const now = new Date("2026-10-05T12:00:00Z")
    const created = new Date("2026-10-01T12:00:00Z") // 4 days elapsed, target is 2 days

    const res = calculateReferralSla(created, "critical", "referred", now)
    expect(res.isOverdue).toBe(true)
    expect(res.status).toBe("overdue")
    expect(res.tone).toBe("critical")
    expect(res.label).toContain("เกิน SLA 2 วัน")
  })

  it("marks completed and cancelled referrals as resolved", () => {
    const now = new Date("2026-10-20T12:00:00Z")
    const created = new Date("2026-10-01T12:00:00Z")

    const resCompleted = calculateReferralSla(created, "high", "completed", now)
    expect(resCompleted.isOverdue).toBe(false)
    expect(resCompleted.status).toBe("resolved")
    expect(resCompleted.tone).toBe("neutral")

    const resCancelled = calculateReferralSla(created, "critical", "cancelled", now)
    expect(resCancelled.isOverdue).toBe(false)
    expect(resCancelled.status).toBe("resolved")
  })
})
