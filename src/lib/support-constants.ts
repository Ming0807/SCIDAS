import type { Database } from "@/types/database.types"

export type SupportStatus = Database["public"]["Enums"]["support_status"]
export type SupportType = Database["public"]["Enums"]["support_type"]
export type SupportPriority = Database["public"]["Enums"]["severity_level"]

export const supportTypeLabels: Record<SupportType, string> = {
  academic: "ด้านวิชาการ/การเรียน",
  behavioral: "ด้านพฤติกรรม/วินัย",
  emotional: "ด้านจิตใจและอารมณ์",
  financial: "ด้านเศรษฐกิจ/ทุนทรัพย์",
  health: "ด้านสุขภาพกาย",
  family: "ด้านครอบครัวและสภาพแวดล้อม",
  social: "ด้านสังคมและความสัมพันธ์",
  other: "ด้านอื่น ๆ",
}

export const supportStatusLabels: Record<SupportStatus, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการช่วยเหลือ",
  completed: "เสร็จสิ้น/บรรลุผล",
  cancelled: "ยกเลิก/ยุติเคส",
  referred: "ส่งต่อหน่วยงานอื่น",
}

export const supportPriorityLabels: Record<SupportPriority, string> = {
  low: "ต่ำ (ทั่วไป)",
  medium: "ปานกลาง (เฝ้าระวัง)",
  high: "สูง (มีความเสี่ยง)",
  critical: "วิกฤต (เร่งด่วนที่สุด)",
}

export function getSupportTypeLabel(type: SupportType): string {
  return supportTypeLabels[type] ?? type
}

export function getSupportStatusLabel(status: SupportStatus): string {
  return supportStatusLabels[status] ?? status
}

export function getSupportPriorityLabel(priority: SupportPriority | null | undefined): string {
  if (!priority) return "ไม่ระบุ"
  return supportPriorityLabels[priority] ?? priority
}

export function getSupportStatusTone(
  status: SupportStatus,
): "normal" | "watch" | "high-risk" | "info" | "neutral" {
  switch (status) {
    case "completed":
      return "normal"
    case "in_progress":
      return "info"
    case "pending":
      return "watch"
    case "referred":
      return "high-risk"
    case "cancelled":
      return "neutral"
    default:
      return "neutral"
  }
}

export type SupportFollowupItem = {
  id: string
  followupDate: string
  description: string
  result: string | null
  improvementNoted: boolean | null
  nextAction: string | null
  followerName?: string | null
}

export type SupportPrintData = {
  caseId: string
  title: string
  description: string
  supportType: SupportType
  status: SupportStatus
  priority: SupportPriority | null
  studentName: string
  studentCode: string | null
  classroomLabel?: string | null
  providerName: string
  semesterId: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  actionPlan: string | null
  providedSupport: string | null
  resourcesUsed: string | null
  externalReferral: string | null
  followups: SupportFollowupItem[]
}
