import type { StatusTone } from "@/lib/design/status"

export type StudentRiskLevel = "normal" | "watch" | "high"

const gradeLabels: Record<string, string> = {
  k1: "อ.1",
  k2: "อ.2",
  k3: "อ.3",
  p1: "ป.1",
  p2: "ป.2",
  p3: "ป.3",
  p4: "ป.4",
  p5: "ป.5",
  p6: "ป.6",
  m1: "ม.1",
  m2: "ม.2",
  m3: "ม.3",
  m4: "ม.4",
  m5: "ม.5",
  m6: "ม.6",
}

export const fullGradeLabels: Record<string, string> = {
  k1: "อนุบาล 1 (อ.1)",
  k2: "อนุบาล 2 (อ.2)",
  k3: "อนุบาล 3 (อ.3)",
  p1: "ประถมศึกษาปีที่ 1 (ป.1)",
  p2: "ประถมศึกษาปีที่ 2 (ป.2)",
  p3: "ประถมศึกษาปีที่ 3 (ป.3)",
  p4: "ประถมศึกษาปีที่ 4 (ป.4)",
  p5: "ประถมศึกษาปีที่ 5 (ป.5)",
  p6: "ประถมศึกษาปีที่ 6 (ป.6)",
  m1: "มัธยมศึกษาปีที่ 1 (ม.1)",
  m2: "มัธยมศึกษาปีที่ 2 (ม.2)",
  m3: "มัธยมศึกษาปีที่ 3 (ม.3)",
  m4: "มัธยมศึกษาปีที่ 4 (ม.4)",
  m5: "มัธยมศึกษาปีที่ 5 (ม.5)",
  m6: "มัธยมศึกษาปีที่ 6 (ม.6)",
}

export const GRADE_SORT_ORDER: Record<string, number> = {
  k1: 1,
  k2: 2,
  k3: 3,
  p1: 11,
  p2: 12,
  p3: 13,
  p4: 14,
  p5: 15,
  p6: 16,
  m1: 21,
  m2: 22,
  m3: 23,
  m4: 24,
  m5: 25,
  m6: 26,
}

export function compareGradeLevels(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  const orderA = a ? (GRADE_SORT_ORDER[a.toLowerCase()] ?? 99) : 99
  const orderB = b ? (GRADE_SORT_ORDER[b.toLowerCase()] ?? 99) : 99
  if (orderA !== orderB) return orderA - orderB
  return (a || "").localeCompare(b || "", "th")
}

const riskLabels: Record<StudentRiskLevel, string> = {
  normal: "ปกติ",
  watch: "ติดตาม",
  high: "เสี่ยงสูง",
}

const riskTones: Record<StudentRiskLevel, StatusTone> = {
  normal: "normal",
  watch: "watch",
  high: "high-risk",
}

export function formatGradeLevel(gradeLevel?: string | null) {
  if (!gradeLevel) {
    return "-"
  }

  return gradeLabels[gradeLevel] ?? gradeLevel.toUpperCase()
}

export function formatFullGradeLevel(gradeLevel?: string | null) {
  if (!gradeLevel) {
    return "-"
  }

  return fullGradeLabels[gradeLevel] ?? gradeLabels[gradeLevel] ?? gradeLevel.toUpperCase()
}

export function formatClassroomSection(section?: number | string | null) {
  if (section === null || section === undefined || section === "") {
    return "-"
  }

  return String(section)
}

export function formatClassroomLabel({
  gradeLevel,
  section,
  classroomName,
}: {
  gradeLevel?: string | null
  section?: number | string | null
  classroomName?: string | null
}) {
  if (classroomName) {
    return classroomName
  }

  const grade = formatGradeLevel(gradeLevel)
  const classroom = formatClassroomSection(section)

  if (grade === "-" && classroom === "-") {
    return "-"
  }

  if (classroom === "-") {
    return grade
  }

  if (grade === "-") {
    return `ห้อง ${classroom}`
  }

  return `${grade}/${classroom}`
}

export function getStudentRiskLabel(riskLevel?: string | null) {
  if (riskLevel === "high" || riskLevel === "watch" || riskLevel === "normal") {
    return riskLabels[riskLevel]
  }

  return "ไม่ทราบสถานะ"
}

export function getStudentRiskTone(riskLevel?: string | null): StatusTone {
  if (riskLevel === "high" || riskLevel === "watch" || riskLevel === "normal") {
    return riskTones[riskLevel]
  }

  return "neutral"
}

const familyStatusLabels: Record<string, string> = {
  together: "อยู่พร้อมหน้า",
  separated: "บิดา/มารดาแยกกันอยู่",
  single_parent: "พ่อหรือแม่เลี้ยงเดี่ยว",
  orphan: "กำพร้า",
  guardian: "อยู่กับญาติ/ผู้อุปการะ",
  other: "อื่นๆ",
}

export function getFamilyStatusLabel(familyStatus?: string | null) {
  if (familyStatus && familyStatusLabels[familyStatus]) {
    return familyStatusLabels[familyStatus]
  }

  return "ไม่ระบุ"
}

export function formatPercent(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-"
  }

  return `${value.toFixed(digits)}%`
}

export function formatThaiShortDate(value?: string | null) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(date)
}

export function getStudentInitials(fullName: string): string {
  if (!fullName) return "?"

  const parts = fullName.trim().split(/\s+/)

  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return parts[0].charAt(0).toUpperCase()
}

export function formatThaiDateTime(value?: string | null) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getTodayBangkok(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(date)
}

