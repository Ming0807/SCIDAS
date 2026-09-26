export const RISK_WEIGHT_FACTOR_KEYS = [
  "frequent_absence",
  "frequent_late",
  "low_grades",
  "low_basic_skills",
  "missing_assignments",
  "family_problems",
  "travel_difficulty",
  "teacher_flagged",
] as const

export type RiskWeightFactorKey = (typeof RISK_WEIGHT_FACTOR_KEYS)[number]

export const RISK_WEIGHT_LABELS: Record<RiskWeightFactorKey, string> = {
  frequent_absence: "ขาดเรียนบ่อย",
  frequent_late: "มาสายบ่อย",
  low_grades: "คะแนนต่ำ",
  low_basic_skills: "อ่าน/เขียน/คิดเลขต่ำกว่าเกณฑ์",
  missing_assignments: "ไม่ส่งงานบ่อย",
  family_problems: "มีปัญหาครอบครัว",
  travel_difficulty: "เดินทางมาเรียนลำบาก",
  teacher_flagged: "ครูระบุว่าควรติดตาม",
}

export const RISK_WEIGHT_DEFAULTS: Record<RiskWeightFactorKey, number> = {
  frequent_absence: 20,
  frequent_late: 10,
  low_grades: 20,
  low_basic_skills: 15,
  missing_assignments: 10,
  family_problems: 15,
  travel_difficulty: 10,
  teacher_flagged: 10,
}
