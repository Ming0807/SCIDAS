import type { Database } from "@/types/database.types"

export type NotificationType = Database["public"]["Enums"]["notification_type"]

export type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  referenceType: string | null
  referenceId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  senderName: string | null
}

export type NotificationCounts = {
  total: number
  unread: number
  byType: Record<NotificationType, number>
}

export type NotificationStatusFilter = "all" | "unread" | "read"

export type NotificationFilter = {
  /** @deprecated Use `status` instead */
  unreadOnly?: boolean
  status?: NotificationStatusFilter
  type?: NotificationType
  page?: number
  limit?: number
}

export type NotificationPage = {
  items: NotificationItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export const notificationTypeLabels: Record<NotificationType, string> = {
  risk_alert: "ความเสี่ยง",
  attendance_alert: "การมาเรียน",
  assignment_alert: "การบ้าน",
  behavior_alert: "พฤติกรรม",
  home_visit_reminder: "เยี่ยมบ้าน",
  plan_review: "แผนพัฒนา",
  system: "ระบบ",
  general: "ทั่วไป",
}

export const allNotificationTypes: NotificationType[] = [
  "risk_alert",
  "attendance_alert",
  "assignment_alert",
  "behavior_alert",
  "home_visit_reminder",
  "plan_review",
  "system",
  "general",
]

export function getNotificationTypeLabel(type: NotificationType): string {
  return notificationTypeLabels[type] ?? type.replace(/_/g, " ")
}

export function formatRelativeTime(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()

  if (Number.isNaN(then)) return isoDate

  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return "เมื่อสักครู่"
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`
  if (diffDay === 1) return "เมื่อวาน"
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(new Date(isoDate))
}
