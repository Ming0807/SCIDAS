import { describe, expect, it } from "vitest"
import {
  evaluateRiskActionRules,
  type RiskSignalInput,
} from "./risk-action-rules"

function makeSignalInput(overrides: Partial<RiskSignalInput> = {}): RiskSignalInput {
  return {
    studentId: "11111111-1111-4111-8111-111111111111",
    studentName: "สมชาย รักเรียน",
    absentDays30d: 0,
    attendanceRate30d: 95,
    negativeBehaviorCount30d: 0,
    urgentHomeVisit: false,
    urgentHomeVisitDetail: null,
    gpa: 3.25,
    riskLevel: "normal",
    openSupportCount: 0,
    activePlanCount: 0,
    openActionCount: 0,
    ...overrides,
  }
}

describe("evaluateRiskActionRules (E1 Risk→action loop)", () => {
  it("returns no suggestions for healthy normal student", () => {
    const input = makeSignalInput()
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toEqual([])
  })

  it("suggests support record for absence streak (>= 3 days absent)", () => {
    const input = makeSignalInput({
      absentDays30d: 3,
      attendanceRate30d: 85,
    })
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]?.ruleId).toBe("ABSENCE_STREAK")
    expect(suggestions[0]?.priority).toBe("high")
    expect(suggestions[0]?.category).toBe("attendance")
    expect(suggestions[0]?.supportType).toBe("family")
  })

  it("elevates absence streak to critical when >= 5 days absent or attendance < 70%", () => {
    const input = makeSignalInput({
      absentDays30d: 5,
      attendanceRate30d: 65,
    })
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]?.ruleId).toBe("ABSENCE_STREAK")
    expect(suggestions[0]?.priority).toBe("critical")
  })

  it("suggests behavioral support for repeated negative behavior (>= 2 times)", () => {
    const input = makeSignalInput({
      negativeBehaviorCount30d: 2,
    })
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]?.ruleId).toBe("REPEATED_BEHAVIOR")
    expect(suggestions[0]?.priority).toBe("high")
    expect(suggestions[0]?.category).toBe("behavior")
    expect(suggestions[0]?.supportType).toBe("behavioral")
  })

  it("elevates repeated behavior to critical when count >= 3", () => {
    const input = makeSignalInput({
      negativeBehaviorCount30d: 3,
    })
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]?.ruleId).toBe("REPEATED_BEHAVIOR")
    expect(suggestions[0]?.priority).toBe("critical")
  })

  it("suggests urgent financial/welfare support for urgent home visit findings", () => {
    const input = makeSignalInput({
      urgentHomeVisit: true,
      urgentHomeVisitDetail: "บ้านชำรุดทรุดโทรม ไม่มีไฟฟ้า",
    })
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]?.ruleId).toBe("URGENT_HOME_VISIT")
    expect(suggestions[0]?.priority).toBe("critical")
    expect(suggestions[0]?.category).toBe("family")
    expect(suggestions[0]?.supportType).toBe("financial")
    expect(suggestions[0]?.description).toContain("บ้านชำรุดทรุดโทรม")
  })

  it("suggests IDP plan for low GPA (< 1.50)", () => {
    const input = makeSignalInput({
      gpa: 1.45,
    })
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]?.ruleId).toBe("LOW_GPA")
    expect(suggestions[0]?.priority).toBe("high")
    expect(suggestions[0]?.category).toBe("academic")
    expect(suggestions[0]?.suggestedActionType).toBe("idp")
    expect(suggestions[0]?.actionHref).toContain("/development-plans/new")
  })

  it("elevates low GPA to critical when GPA < 1.00", () => {
    const input = makeSignalInput({
      gpa: 0.85,
    })
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]?.ruleId).toBe("LOW_GPA")
    expect(suggestions[0]?.priority).toBe("critical")
  })

  it("suggests opening a support case for high risk student without any open care", () => {
    const input = makeSignalInput({
      riskLevel: "high",
      openSupportCount: 0,
      activePlanCount: 0,
    })
    const suggestions = evaluateRiskActionRules(input)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]?.ruleId).toBe("CRITICAL_RISK")
    expect(suggestions[0]?.priority).toBe("high")
    expect(suggestions[0]?.category).toBe("support")
  })

  it("does not suggest CRITICAL_RISK if student already has active support or plan", () => {
    const inputWithSupport = makeSignalInput({
      riskLevel: "high",
      openSupportCount: 1,
      activePlanCount: 0,
    })
    expect(evaluateRiskActionRules(inputWithSupport)).toEqual([])

    const inputWithPlan = makeSignalInput({
      riskLevel: "high",
      openSupportCount: 0,
      activePlanCount: 1,
    })
    expect(evaluateRiskActionRules(inputWithPlan)).toEqual([])
  })

  it("handles multiple concurrent risk signals cleanly", () => {
    const multiRiskInput = makeSignalInput({
      absentDays30d: 4,
      attendanceRate30d: 78,
      negativeBehaviorCount30d: 2,
      urgentHomeVisit: true,
      gpa: 1.25,
      riskLevel: "high",
      openSupportCount: 0,
      activePlanCount: 0,
    })
    const suggestions = evaluateRiskActionRules(multiRiskInput)
    expect(suggestions).toHaveLength(5)
    const ruleIds = suggestions.map((s) => s.ruleId)
    expect(ruleIds).toContain("ABSENCE_STREAK")
    expect(ruleIds).toContain("REPEATED_BEHAVIOR")
    expect(ruleIds).toContain("URGENT_HOME_VISIT")
    expect(ruleIds).toContain("LOW_GPA")
    expect(ruleIds).toContain("CRITICAL_RISK")
  })
})
