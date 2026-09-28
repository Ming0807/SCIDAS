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

export const behaviorCategoryLabels: Record<string, string> = {
  academic: "วิชาการ",
  helpfulness: "มีน้ำใจ",
  discipline: "ระเบียบวินัย",
  disruption: "ก่อกวน",
  tardiness: "มาสาย/ขาดเรียน",
  other: "อื่นๆ",
}

export const behaviorCategoryOptions: Array<{ value: string; label: string }> = [
  { value: "academic", label: "ผลการเรียนโดดเด่น / ทุ่มเท" },
  { value: "helpfulness", label: "มีน้ำใจช่วยเหลือ" },
  { value: "discipline", label: "ระเบียบวินัย" },
  { value: "disruption", label: "ก่อกวนในชั้นเรียน" },
  { value: "tardiness", label: "มาสาย / ขาดเรียน" },
  { value: "other", label: "อื่นๆ" },
]

export const behaviorSeverityLabels: Record<string, string> = {
  low: "ปกติ",
  medium: "เฝ้าระวัง",
  high: "ร้ายแรง",
  critical: "วิกฤต",
}

export const behaviorSeverityOptions: Array<{ value: string; label: string }> = [
  { value: "low", label: "ปกติ" },
  { value: "medium", label: "เฝ้าระวัง" },
  { value: "high", label: "ร้ายแรง" },
  { value: "critical", label: "วิกฤต" },
]

export function getBehaviorCategoryLabel(category?: string | null): string {
  if (category && behaviorCategoryLabels[category]) return behaviorCategoryLabels[category]
  return category || "ไม่ระบุ"
}

export function getBehaviorSeverityLabel(severity?: string | null): string {
  if (severity && behaviorSeverityLabels[severity]) return behaviorSeverityLabels[severity]
  return severity || "ไม่ระบุ"
}
