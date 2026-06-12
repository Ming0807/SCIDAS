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
    <div className="bg-white sticky top-0 z-20 shadow-sm pt-6 pb-0 px-1">
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="w-8"></div>
        <span className="text-base font-semibold text-slate-900">การแจ้งเตือน</span>
        <Link
          href="/settings"
          aria-label="Notification settings"
          className="p-2 -mr-2 text-indigo-600"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Summary Banner */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border border-slate-100 rounded-xl mx-4 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Bell className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-900 leading-tight mb-0.5">การแจ้งเตือน</h2>
            <div className="text-xs text-slate-500 mb-1.5">ศูนย์รวมการแจ้งเตือนทั้งหมด</div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-md w-max border border-indigo-100">
              {counts.unread} รายการใหม่
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="relative mb-1">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            {counts.unread > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full border-2 border-white">
                {counts.unread}
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400">ทั้งหมด {counts.total} รายการ</span>
          {counts.unread > 0 && (
            <span className="text-xs font-semibold text-red-500">ยังไม่ได้อ่าน {counts.unread} รายการ</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-100 px-4 pb-3 overflow-x-auto no-scrollbar">
        <Link
          href={buildNotificationHref({ status: "all", type: currentType })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
            currentStatus === "all"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          ทั้งหมด {counts.total}
        </Link>
        <Link
          href={buildNotificationHref({ status: "unread", type: currentType })}
          className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            currentStatus === "unread"
              ? "bg-red-100 text-red-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          ยังไม่ได้อ่าน
          {counts.unread > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-1.5 rounded-full">
              {counts.unread}
            </span>
          )}
        </Link>
        <Link
          href={buildNotificationHref({ status: "read", type: currentType })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
            currentStatus === "read"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          อ่านแล้ว {readCount}
        </Link>
      </div>

    </div>
  )
}
