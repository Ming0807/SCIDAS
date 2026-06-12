import { createClient } from "@/utils/supabase/server"
import type { Database } from "@/types/database.types"

import { getCurrentUserContext } from "./current-user"

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

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"]
type NotificationType = Database["public"]["Enums"]["notification_type"]

export type { NotificationType }

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

const notificationTypeLabels: Record<NotificationType, string> = {
  risk_alert: "ความเสี่ยง",
  attendance_alert: "การมาเรียน",
  assignment_alert: "การบ้าน",
  behavior_alert: "พฤติกรรม",
  home_visit_reminder: "เยี่ยมบ้าน",
  plan_review: "แผนพัฒนา",
  system: "ระบบ",
  general: "ทั่วไป",
}

const allNotificationTypes: NotificationType[] = [
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

export function getNotificationSourceLink(
  referenceType: string | null,
  referenceId: string | null,
  link: string | null,
): string | null {
  const normalizedLink = normalizeInternalLink(link)
  if (normalizedLink) return normalizedLink

  if (!referenceType || !referenceId) return null

  const refMap: Record<string, string> = {
    support_records: `/support`,
    risk_assessments: `/risk-analysis`,
    students: `/students/${referenceId}`,
    student: `/students/${referenceId}`,
    development_plans: `/development-plans`,
    home_visits: `/home-visits`,
    behavior_records: `/behavior`,
    attendance_records: `/attendance`,
    report_jobs: `/reports`,
  }

  return refMap[referenceType] ?? null
}

function normalizeInternalLink(link: string | null): string | null {
  const trimmed = link?.trim()

  if (!trimmed) return null
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null

  return trimmed
}

function toNotificationItem(
  row: NotificationRow & {
    sender?: { first_name: string | null; last_name: string | null } | null
  },
): NotificationItem {
  const senderName = row.sender
    ? `${row.sender.first_name ?? ""} ${row.sender.last_name ?? ""}`.trim()
    : null

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: getNotificationSourceLink(row.reference_type, row.reference_id, row.link),
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
    senderName: senderName || null,
  }
}

function resolveStatusFilter(filter: NotificationFilter): NotificationStatusFilter {
  if (filter.status && filter.status !== "all") return filter.status
  // backward compat: unreadOnly takes precedence
  if (filter.unreadOnly) return "unread"
  return filter.status ?? "all"
}

const MAX_NOTIFICATION_LIMIT = 50
const DEFAULT_NOTIFICATION_LIMIT = 20

function parsePageNumber(raw: unknown): number {
  const p = Number.parseInt(String(raw ?? ""), 10)
  return Number.isFinite(p) && p > 0 ? p : 1
}

function safeLimit(raw: unknown): number {
  const l = Number.parseInt(String(raw ?? ""), 10)
  if (!Number.isFinite(l) || l < 1) return DEFAULT_NOTIFICATION_LIMIT
  return Math.min(l, MAX_NOTIFICATION_LIMIT)
}

export async function getNotifications(
  filter: NotificationFilter = {},
): Promise<NotificationPage> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()
  const status = resolveStatusFilter(filter)
  const pageSize = safeLimit(filter.limit)
  const page = parsePageNumber(filter.page)

  // Build the base query for counting and data
  let baseQuery = client
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)

  if (status === "unread") {
    baseQuery = baseQuery.eq("is_read", false)
  } else if (status === "read") {
    baseQuery = baseQuery.eq("is_read", true)
  }

  if (filter.type) {
    baseQuery = baseQuery.eq("type", filter.type)
  }

  const { count, error: countError } = await baseQuery

  if (countError) {
    throw new Error(countError.message)
  }

  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(page, totalPages)
  const offset = (safePage - 1) * pageSize

  // Fetch the page of data
  let dataQuery = client
    .from("notifications")
    .select(
      `
      id,
      type,
      title,
      message,
      link,
      reference_type,
      reference_id,
      is_read,
      read_at,
      created_at,
      sender:profiles!notifications_sender_id_fkey (
        first_name,
        last_name
      )
    `,
    )
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (status === "unread") {
    dataQuery = dataQuery.eq("is_read", false)
  } else if (status === "read") {
    dataQuery = dataQuery.eq("is_read", true)
  }

  if (filter.type) {
    dataQuery = dataQuery.eq("type", filter.type)
  }

  const { data, error } = await dataQuery

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as unknown as (NotificationRow & {
    sender: { first_name: string | null; last_name: string | null } | null
  })[]

  return {
    items: rows.map(toNotificationItem),
    totalCount,
    page: safePage,
    pageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  }
}

export async function getNotificationCounts(): Promise<NotificationCounts> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()

  const { data, error } = await client
    .from("notifications")
    .select("id, type, is_read")
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)

  if (error) {
    throw new Error(error.message)
  }

  const rows = data ?? []

  const byType: Record<string, number> = {}
  for (const t of allNotificationTypes) {
    byType[t] = 0
  }

  let total = 0
  let unread = 0

  for (const row of rows) {
    total++
    if (!row.is_read) unread++
    if (row.type && byType[row.type] !== undefined) {
      byType[row.type]++
    }
  }

  return {
    total,
    unread,
    byType: byType as Record<NotificationType, number>,
  }
}

export async function markAllNotificationsRead(): Promise<{ count: number }> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()

  const now = new Date().toISOString()

  const { data, error } = await client
    .from("notifications")
    .update({ is_read: true, read_at: now })
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)
    .eq("is_read", false)
    .select("id")

  if (error) {
    throw new Error(error.message)
  }

  return { count: (data ?? []).length }
}

export async function toggleNotificationRead(
  notificationId: string,
): Promise<{ isRead: boolean }> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("VALIDATION_ERROR")
  }

  const client = await createClient()

  // Fetch current state scoped to recipient + school
  const { data: existing, error: fetchError } = await client
    .from("notifications")
    .select("id, is_read")
    .eq("id", notificationId)
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (!existing) {
    throw new Error("NOT_FOUND")
  }

  const newIsRead = !existing.is_read
  const now = new Date().toISOString()

  const { error: updateError } = await client
    .from("notifications")
    .update({
      is_read: newIsRead,
      read_at: newIsRead ? now : null,
    })
    .eq("id", notificationId)
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  return { isRead: newIsRead }
}
