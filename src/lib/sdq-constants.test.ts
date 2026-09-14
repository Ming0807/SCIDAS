import { describe, it, expect } from "vitest"
import {
  calculateSdqScores,
  getEvaluatorTypeLabel,
  getSdqClassificationLabel,
  getSdqDefaultRecommendation,
  SDQ_DIMENSION_CUTOFFS,
  SDQ_QUESTIONS,
  SDQ_TOTAL_DIFFICULTIES_CUTOFF,
} from "./sdq-constants"

describe("sdq-constants", () => {
  it("has exactly 25 questions across 5 dimensions", () => {
    expect(SDQ_QUESTIONS.length).toBe(25)
    const counts = SDQ_QUESTIONS.reduce((acc, q) => {
      acc[q.dimension] = (acc[q.dimension] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    expect(counts.emotional).toBe(5)
    expect(counts.conduct).toBe(5)
    expect(counts.hyperactivity).toBe(5)
    expect(counts.peer).toBe(5)
    expect(counts.prosocial).toBe(5)
  })

  it("calculates zero difficulties when all negative items are 0 and positive items are 2", () => {
    const answers: Record<number, number> = {}
    for (const q of SDQ_QUESTIONS) {
      if (q.isReversed || q.dimension === "prosocial") {
        answers[q.id] = 2
      } else {
        answers[q.id] = 0
      }
    }

    const result = calculateSdqScores(answers)
    expect(result.totalDifficultiesScore).toBe(0)
    expect(result.overallClassification).toBe("normal")
    expect(result.dimensionScores.prosocial).toBe(10)
    expect(result.dimensionClassifications.prosocial).toBe("normal")
  })

  it("calculates high difficulties and problem classification when problem symptoms are reported", () => {
    const answers: Record<number, number> = {}
    for (const q of SDQ_QUESTIONS) {
      if (q.isReversed || q.dimension === "prosocial") {
        answers[q.id] = 0
      } else {
        answers[q.id] = 2
      }
    }

    const result = calculateSdqScores(answers)
    expect(result.totalDifficultiesScore).toBe(40)
    expect(result.overallClassification).toBe("problem")
    expect(result.dimensionScores.prosocial).toBe(0)
    expect(result.dimensionClassifications.prosocial).toBe("problem")
  })

  it("classifies total score of 16-18 as risk", () => {
    const answers: Record<number, number> = {}
    for (const q of SDQ_QUESTIONS) {
      answers[q.id] = 0
    }
    // Items 7, 11, 14, 21, 25 are reversed (0 gives 2 each = 10 points)
    // Add 7 more points to reach 17 points
    answers[2] = 2
    answers[3] = 2
    answers[5] = 2
    answers[8] = 1

    const result = calculateSdqScores(answers)
    expect(result.totalDifficultiesScore).toBe(17)
    expect(result.overallClassification).toBe("risk")
  })

  it("returns appropriate badge styling from getSdqClassificationLabel", () => {
    expect(getSdqClassificationLabel("normal").text).toBe("ปกติ")
    expect(getSdqClassificationLabel("risk").text).toBe("เสี่ยง")
    expect(getSdqClassificationLabel("problem").text).toBe("มีปัญหา")
  })

  it("returns correct labels for evaluator types", () => {
    expect(getEvaluatorTypeLabel("teacher")).toBe("ครูประเมิน")
    expect(getEvaluatorTypeLabel("student")).toBe("นักเรียนประเมินตนเอง")
    expect(getEvaluatorTypeLabel("parent")).toBe("ผู้ปกครองประเมิน")
  })

  it("provides comprehensive cutoffs for all 5 dimensions and total difficulties", () => {
    expect(SDQ_DIMENSION_CUTOFFS.emotional.maxScore).toBe(10)
    expect(SDQ_DIMENSION_CUTOFFS.conduct.maxScore).toBe(10)
    expect(SDQ_DIMENSION_CUTOFFS.hyperactivity.maxScore).toBe(10)
    expect(SDQ_DIMENSION_CUTOFFS.peer.maxScore).toBe(10)
    expect(SDQ_DIMENSION_CUTOFFS.prosocial.maxScore).toBe(10)
    expect(SDQ_TOTAL_DIFFICULTIES_CUTOFF.maxScore).toBe(40)
  })

  it("generates appropriate recommendation text for normal, risk, and problem", () => {
    expect(getSdqDefaultRecommendation("normal")).toContain("อยู่ในเกณฑ์ปกติ")
    expect(getSdqDefaultRecommendation("risk", ["emotional"])).toContain("ด้านอารมณ์")
    expect(getSdqDefaultRecommendation("problem", ["hyperactivity", "conduct"])).toContain("เร่งด่วน")
  })
})
