import type { NotificationStatusFilter, NotificationType } from "@/lib/server/notification-read-models"

export function buildNotificationHref(params: {
  status?: NotificationStatusFilter
  type?: NotificationType
  page?: number
}): string {
  const sp = new URLSearchParams()

  if (params.status && params.status !== "all") {
    sp.set("status", params.status)
  }
  if (params.type) {
    sp.set("type", params.type)
  }
  if (params.page && params.page > 1) {
    sp.set("page", String(params.page))
  }

  const qs = sp.toString()
  return qs ? `/notifications?${qs}` : "/notifications"
}
