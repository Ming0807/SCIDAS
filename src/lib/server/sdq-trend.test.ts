import { describe, it, expect } from "vitest"
import { calculateSdqTrend } from "./sdq-trend"
import type { SdqHistoryItem } from "@/app/actions/sdq.actions"

function createMockItem(partial: {
  id: string
  assessmentDate: string
  riskLevel: "normal" | "watch" | "high"
  riskScore: number
}): SdqHistoryItem {
  return {
    studentId: "stu-1",
    summary: "แบบประเมิน SDQ รวม 25 ข้อ",
    ...partial,
  }
}

describe("sdq-trend helper (E4)", () => {
  it("handles empty or single assessment gracefully", () => {
    const resEmpty = calculateSdqTrend([])
    expect(resEmpty.hasTrend).toBe(false)
    expect(resEmpty.direction).toBe("insufficient_data")

    const resSingle = calculateSdqTrend([
      createMockItem({ id: "1", assessmentDate: "2026-09-01", riskLevel: "normal", riskScore: 8 }),
    ])
    expect(resSingle.hasTrend).toBe(false)
  })

  it("detects jump from normal to watch and recommends IDP", () => {
    const assessments: SdqHistoryItem[] = [
      createMockItem({ id: "2", assessmentDate: "2026-10-01", riskLevel: "watch", riskScore: 16 }),
      createMockItem({ id: "1", assessmentDate: "2026-05-01", riskLevel: "normal", riskScore: 9 }),
    ]

    const trend = calculateSdqTrend(assessments)
    expect(trend.hasTrend).toBe(true)
    expect(trend.isJump).toBe(true)
    expect(trend.direction).toBe("worsened")
    expect(trend.suggestedAction).toBe("idp")
    expect(trend.scoreDelta).toBe(7)
  })

  it("detects jump from watch to high and recommends referral", () => {
    const assessments: SdqHistoryItem[] = [
      createMockItem({ id: "2", assessmentDate: "2026-10-01", riskLevel: "high", riskScore: 24 }),
      createMockItem({ id: "1", assessmentDate: "2026-05-01", riskLevel: "watch", riskScore: 16 }),
    ]

    const trend = calculateSdqTrend(assessments)
    expect(trend.hasTrend).toBe(true)
    expect(trend.isJump).toBe(true)
    expect(trend.direction).toBe("worsened")
    expect(trend.suggestedAction).toBe("referral")
    expect(trend.scoreDelta).toBe(8)
  })

  it("detects improvement when risk score drops significantly", () => {
    const assessments: SdqHistoryItem[] = [
      createMockItem({ id: "2", assessmentDate: "2026-10-01", riskLevel: "normal", riskScore: 7 }),
      createMockItem({ id: "1", assessmentDate: "2026-05-01", riskLevel: "watch", riskScore: 15 }),
    ]

    const trend = calculateSdqTrend(assessments)
    expect(trend.hasTrend).toBe(true)
    expect(trend.direction).toBe("improved")
    expect(trend.isJump).toBe(false)
    expect(trend.scoreDelta).toBe(-8)
  })

  it("detects stable trend when scores remain similar", () => {
    const assessments: SdqHistoryItem[] = [
      createMockItem({ id: "2", assessmentDate: "2026-10-01", riskLevel: "normal", riskScore: 9 }),
      createMockItem({ id: "1", assessmentDate: "2026-05-01", riskLevel: "normal", riskScore: 8 }),
    ]

    const trend = calculateSdqTrend(assessments)
    expect(trend.hasTrend).toBe(true)
    expect(trend.direction).toBe("stable")
    expect(trend.isJump).toBe(false)
  })
})
