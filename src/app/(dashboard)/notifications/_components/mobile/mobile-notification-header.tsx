import React from "react"
import Link from "next/link"
import { Settings, Bell } from "lucide-react"
import type {
  NotificationCounts,
  NotificationStatusFilter,
  NotificationType,
} from "@/lib/server/notification-read-models"
import { buildNotificationHref } from "../notification-link-helpers"

export interface MobileNotificationHeaderProps {
  counts: NotificationCounts
  currentStatus: NotificationStatusFilter
  currentType?: NotificationType
}

export function MobileNotificationHeader({
  counts,
  currentStatus,
  currentType,
}: MobileNotificationHeaderProps) {
  const readCount = Math.max(counts.total - counts.unread, 0)

  return (
    <div className="bg-card sticky top-0 z-20 shadow-sm pt-6 pb-0 px-1 border-b border-border">
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="w-8"></div>
        <span className="text-base font-semibold text-foreground">การแจ้งเตือน</span>
        <Link
          href="/settings"
          aria-label="Notification settings"
          className="p-2 -mr-2 text-primary hover:opacity-80 transition-opacity"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Summary Banner */}
      <div className="px-4 py-3 flex items-center justify-between bg-card border border-border rounded-xl mx-4 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-foreground leading-tight mb-0.5">การแจ้งเตือน</h2>
            <div className="text-xs text-muted-foreground mb-1.5">ศูนย์รวมการแจ้งเตือนทั้งหมด</div>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-md w-max border border-primary/20">
              {counts.unread} รายการใหม่
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="relative mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            {counts.unread > 0 && (
              <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full border-2 border-card">
                {counts.unread}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">ทั้งหมด {counts.total} รายการ</span>
          {counts.unread > 0 && (
            <span className="text-xs font-semibold text-destructive">ยังไม่ได้อ่าน {counts.unread} รายการ</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t border-border px-4 py-3 overflow-x-auto no-scrollbar">
        <Link
          href={buildNotificationHref({ status: "all", type: currentType })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            currentStatus === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          ทั้งหมด {counts.total}
        </Link>
        <Link
          href={buildNotificationHref({ status: "unread", type: currentType })}
          className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            currentStatus === "unread"
              ? "bg-destructive text-destructive-foreground font-semibold"
              : "bg-destructive/10 text-destructive hover:bg-destructive/15"
          }`}
        >
          ยังไม่ได้อ่าน
          {counts.unread > 0 && (
            <span className="bg-destructive-foreground/20 text-current text-xs font-semibold px-1.5 rounded-full">
              {counts.unread}
            </span>
          )}
        </Link>
        <Link
          href={buildNotificationHref({ status: "read", type: currentType })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            currentStatus === "read"
              ? "bg-emerald-600 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          อ่านแล้ว {readCount}
        </Link>
      </div>

    </div>
  )
}
