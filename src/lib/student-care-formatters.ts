import type { StatusTone } from "@/lib/design/status"

export type StudentRiskLevel = "normal" | "watch" | "high"

const gradeLabels: Record<string, string> = {
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
