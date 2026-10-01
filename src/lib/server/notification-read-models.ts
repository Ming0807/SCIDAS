import { createClient } from "@/utils/supabase/server"
import type { Database } from "@/types/database.types"

import { getCurrentUserContext } from "./current-user"

import type {
  NotificationType,
  NotificationItem,
  NotificationCounts,
  NotificationStatusFilter,
  NotificationFilter,
  NotificationPage,
} from "@/lib/notification-constants"

import {
  notificationTypeLabels,
  allNotificationTypes,
  getNotificationTypeLabel,
  formatRelativeTime,
} from "@/lib/notification-constants"

export type {
  NotificationType,
  NotificationItem,
  NotificationCounts,
  NotificationStatusFilter,
  NotificationFilter,
  NotificationPage,
}

export {
  notificationTypeLabels,
  allNotificationTypes,
  getNotificationTypeLabel,
  formatRelativeTime,
}

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"]


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
  const muted = await getMutedNotificationTypes().catch(() => [] as NotificationType[])

  // Build the base query for counting and data
  let baseQuery = client
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)

  if (muted.length > 0) {
    baseQuery = baseQuery.not("type", "in", `(${muted.map((t) => `"${t}"`).join(",")})`)
  }

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

  if (muted.length > 0) {
    dataQuery = dataQuery.not("type", "in", `(${muted.map((t) => `"${t}"`).join(",")})`)
  }

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

  const mutedSet = new Set(await getMutedNotificationTypes().catch(() => [] as NotificationType[]))

  const byType: Record<string, number> = {}
  for (const t of allNotificationTypes) {
    byType[t] = 0
  }

  let total = 0
  let unread = 0

  for (const row of rows) {
    if (mutedSet.has(row.type as NotificationType)) continue
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
  const muted = await getMutedNotificationTypes().catch(() => [] as NotificationType[])

  const now = new Date().toISOString()

  let updateQuery = client
    .from("notifications")
    .update({ is_read: true, read_at: now })
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)
    .eq("is_read", false)

  if (muted.length > 0) {
    updateQuery = updateQuery.not("type", "in", `(${muted.map((t) => `"${t}"`).join(",")})`)
  }

  const { data, error } = await updateQuery.select("id")

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

export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("VALIDATION_ERROR")
  }

  const client = await createClient()

  const { error } = await client
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("recipient_id", context.profileId)
    .eq("school_id", context.schoolId)

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

const NOTIFICATION_PREFS_SCOPE = "notifications"
const MUTED_TYPES_KEY = "muted_types"

function sanitizeMutedTypes(raw: unknown): NotificationType[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((t): t is NotificationType =>
    typeof t === "string" && (allNotificationTypes as string[]).includes(t),
  )
}

/**
 * Notification types the current user muted. Muted types are excluded from
 * the list, counts, and unread badge (FR-11 preferences).
 */
export async function getMutedNotificationTypes(): Promise<NotificationType[]> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()
  const { data, error } = await client
    .from("user_dashboard_preferences")
    .select("value")
    .eq("school_id", context.schoolId)
    .eq("user_id", context.profileId)
    .eq("scope", NOTIFICATION_PREFS_SCOPE)
    .eq("key", MUTED_TYPES_KEY)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  const value = (data as { value?: unknown } | null)?.value
  const muted = value && typeof value === "object"
    ? (value as { muted?: unknown }).muted
    : value
  return sanitizeMutedTypes(muted)
}

export async function setMutedNotificationTypes(
  types: string[],
): Promise<NotificationType[]> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const sanitized = sanitizeMutedTypes(types)
  const client = await createClient()
  const { error } = await client
    .from("user_dashboard_preferences")
    .upsert(
      {
        school_id: context.schoolId,
        user_id: context.profileId,
        scope: NOTIFICATION_PREFS_SCOPE,
        key: MUTED_TYPES_KEY,
        value: { muted: sanitized },
      },
      { onConflict: "school_id,user_id,scope,key" },
    )

  if (error) {
    throw new Error(error.message)
  }

  return sanitized
}
