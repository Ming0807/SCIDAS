export type ConductTier = "excellent" | "good" | "fair" | "needs_improvement"

export type StudentConductItem = {
  studentId: string
  studentName: string
  studentClass: string | null
  baseScore: number
  deductedPoints: number
  addedPoints: number
  finalScore: number
  tier: ConductTier
  tierLabel: string
  recordsCount: number
}

export type ConductSummary = {
  averageScore: number
  excellentCount: number
  goodCount: number
  fairCount: number
  needsImprovementCount: number
  conductList: StudentConductItem[]
}

export function getConductTier(score: number): { tier: ConductTier; label: string } {
  if (score >= 90) return { tier: "excellent", label: "ดีเยี่ยม (90-100)" }
  if (score >= 80) return { tier: "good", label: "ดี (80-89)" }
  if (score >= 60) return { tier: "fair", label: "ปานกลาง (60-79)" }
  return { tier: "needs_improvement", label: "ต้องปรับปรุงเร่งด่วน (<60)" }
}
