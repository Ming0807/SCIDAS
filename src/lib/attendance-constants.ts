export type AttendanceStatus = "present" | "absent" | "late" | "leave" | "sick"

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "มาเรียน",
  absent: "ขาด",
  late: "มาสาย",
  leave: "ลา",
  sick: "ป่วย",
}

export function getAttendanceStatusLabel(status: AttendanceStatus): string {
  return attendanceStatusLabels[status] ?? status
}

export function getAttendanceStatusTone(
  status: AttendanceStatus,
): "success" | "danger" | "info" | "warning" {
  switch (status) {
    case "present":
      return "success"
    case "absent":
      return "danger"
    case "late":
      return "info"
    case "leave":
    case "sick":
      return "warning"
    default:
      return "info"
  }
}

export type AttendanceRiskLevel = "normal" | "watch" | "critical"

export function getAttendanceRisk(attendanceRate: number): {
  riskLevel: AttendanceRiskLevel
  riskLabel: string
} {
  if (attendanceRate < 80) {
    return {
      riskLevel: "critical",
      riskLabel: "เสี่ยง มส. (< 80%)",
    }
  }
  if (attendanceRate < 85) {
    return {
      riskLevel: "watch",
      riskLabel: "เฝ้าระวัง (80-85%)",
    }
  }
  return {
    riskLevel: "normal",
    riskLabel: "ปกติ (≥ 85%)",
  }
}

export type StudentMonthlyAttendanceItem = {
  studentId: string
  studentName: string
  studentCode: string | null
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  leaveDays: number
  sickDays: number
  attendanceRate: number
  riskLevel: AttendanceRiskLevel
  riskLabel: string
}

export type MonthlyAttendanceSummary = {
  monthStr: string
  monthLabel: string
  totalSchoolDays: number
  averageAttendanceRate: number
  criticalRiskCount: number
  watchRiskCount: number
  perfectAttendanceCount: number
  items: StudentMonthlyAttendanceItem[]
}
