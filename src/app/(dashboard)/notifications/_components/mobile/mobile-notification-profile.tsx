import React from "react"
import { MobileNotificationHeader } from "./mobile-notification-header"
import { MobileNotificationList } from "./mobile-notification-list"
import type { NotificationItem, NotificationCounts, NotificationStatusFilter, NotificationType } from "@/lib/server/notification-read-models"

export interface MobileNotificationProfileProps {
  notifications: NotificationItem[]
  counts: NotificationCounts
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  currentStatus: NotificationStatusFilter
  currentType?: NotificationType
}

export function MobileNotificationProfile({
  notifications,
  counts,
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  currentStatus,
  currentType,
}: MobileNotificationProfileProps) {
  return (
    <div className="bg-slate-50 min-h-screen relative">
      <MobileNotificationHeader
        counts={counts}
        currentStatus={currentStatus}
        currentType={currentType}
      />
      
      <div className="max-w-md mx-auto pt-2">
        <MobileNotificationList
          notifications={notifications}
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          currentStatus={currentStatus}
          currentType={currentType}
        />
      </div>

    </div>
  )
}
