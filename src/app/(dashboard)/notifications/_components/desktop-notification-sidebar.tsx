import React from "react"
import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar as CalendarIcon,
  ClipboardList,
  LayoutGrid,
  MessageSquare,
  Settings,
  Smile,
  TrendingDown,
} from "lucide-react"

import type { NotificationCounts, NotificationType } from "@/lib/server/notification-read-models"
import { getNotificationTypeLabel } from "@/lib/server/notification-read-models"

export interface DesktopNotificationSidebarProps {
  counts: NotificationCounts
}

const typeIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  risk_alert: AlertCircle,
  attendance_alert: TrendingDown,
  assignment_alert: BookOpen,
  behavior_alert: Smile,
  home_visit_reminder: CalendarIcon,
  plan_review: ClipboardList,
  system: Settings,
  general: Bell,
}

const typeIconColors: Record<NotificationType, string> = {
  risk_alert: "bg-red-100 text-red-600",
  attendance_alert: "bg-orange-100 text-orange-600",
  assignment_alert: "bg-indigo-100 text-indigo-600",
  behavior_alert: "bg-green-100 text-green-600",
  home_visit_reminder: "bg-emerald-100 text-emerald-600",
  plan_review: "bg-purple-100 text-purple-600",
  system: "bg-slate-100 text-slate-600",
  general: "bg-blue-100 text-blue-600",
}

export function DesktopNotificationSidebar({ counts }: DesktopNotificationSidebarProps) {
  const typeRows = (Object.entries(counts.byType) as [NotificationType, number][])
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm">
        <h3 className="relative z-10 mb-1 text-sm font-semibold">ภาพรวมการแจ้งเตือน</h3>
        <div className="relative z-10 mb-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold leading-none">{counts.unread}</span>
          <span className="text-xs opacity-80">รายการที่ยังไม่ได้อ่าน</span>
        </div>
        <div className="relative z-10 text-xs opacity-80">ทั้งหมด {counts.total} รายการ</div>

        <div className="absolute -bottom-4 -right-4 rotate-12 opacity-20">
          <Bell className="h-32 w-32" fill="currentColor" />
        </div>
        {counts.unread > 0 ? (
          <div className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-red-500 text-xs font-bold">
            {counts.unread}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between rounded-xl p-2.5 text-slate-700">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium">ทั้งหมด</span>
            </div>
            <span className="text-xs font-bold text-slate-500">{counts.total}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-2.5 text-indigo-700">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold">ยังไม่ได้อ่าน</span>
            </div>
            <span className="text-xs font-bold text-indigo-600">{counts.unread}</span>
          </div>

          {typeRows.map(([type, count]) => {
            const Icon = typeIcons[type] ?? Bell
            const colorClass = typeIconColors[type] ?? "bg-slate-100 text-slate-600"

            return (
              <div
                key={type}
                className="flex items-center justify-between rounded-xl p-2.5 text-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-sm ${colorClass}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-medium">{getNotificationTypeLabel(type)}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
