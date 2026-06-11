import React from "react"
import { MobileNotificationHeader } from "./mobile-notification-header"
import { MobileNotificationList } from "./mobile-notification-list"
import type { NotificationItem, NotificationCounts } from "@/lib/server/notification-read-models"

export interface MobileNotificationProfileProps {
  notifications: NotificationItem[]
  counts: NotificationCounts
}

export function MobileNotificationProfile({ notifications, counts }: MobileNotificationProfileProps) {
  return (
    <div className="bg-slate-50 min-h-screen relative">
      <MobileNotificationHeader counts={counts} />
      
      <div className="max-w-md mx-auto pt-2">
        <MobileNotificationList notifications={notifications} totalCount={counts.total} />
      </div>

    </div>
  )
}
