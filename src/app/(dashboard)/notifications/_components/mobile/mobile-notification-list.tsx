import React from "react"
import Link from "next/link"
import { ChevronRight, Bell, AlertCircle, TrendingDown, BookOpen, MessageSquare, CalendarIcon, ClipboardList, Settings } from "lucide-react"
import type { NotificationItem, NotificationType } from "@/lib/server/notification-read-models"
import { getNotificationTypeLabel, formatRelativeTime } from "@/lib/server/notification-read-models"
import { EmptyState } from "@/components/feedback"
import { cn } from "@/lib/utils"

export interface MobileNotificationListProps {
  notifications: NotificationItem[]
  totalCount: number
}

type MobileVisual = {
  icon: React.ComponentType<{ className?: string }>
  bgClass: string
  textClass: string
}

const mobileVisuals: Record<NotificationType, MobileVisual> = {
  risk_alert: { icon: AlertCircle, bgClass: "bg-red-50", textClass: "text-red-600" },
  attendance_alert: { icon: TrendingDown, bgClass: "bg-orange-50", textClass: "text-orange-500" },
  assignment_alert: { icon: BookOpen, bgClass: "bg-indigo-50", textClass: "text-indigo-500" },
  behavior_alert: { icon: MessageSquare, bgClass: "bg-green-50", textClass: "text-green-500" },
  home_visit_reminder: { icon: CalendarIcon, bgClass: "bg-emerald-50", textClass: "text-emerald-600" },
  plan_review: { icon: ClipboardList, bgClass: "bg-purple-50", textClass: "text-purple-500" },
  system: { icon: Settings, bgClass: "bg-slate-100", textClass: "text-slate-600" },
  general: { icon: Bell, bgClass: "bg-blue-50", textClass: "text-blue-500" },
}

function MobileNotificationRow({ item }: { item: NotificationItem }) {
  const visual = mobileVisuals[item.type] ?? mobileVisuals.general
  const Icon = visual.icon
  const hasLink = Boolean(item.link)

  const content = (
    <div
      className={cn(
        "rounded-xl p-4 border border-slate-200 shadow-sm flex gap-3 relative",
        hasLink && "cursor-pointer",
        item.isRead ? "bg-slate-50" : "bg-white",
      )}
    >
      {!item.isRead && (
        <div className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-red-500"></div>
      )}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ml-2 ${visual.bgClass} border-current/10`}
      >
        <Icon className={`w-5 h-5 ${visual.textClass}`} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between mb-0.5">
          <h4 className="text-sm font-semibold text-slate-800 leading-tight pr-2 truncate">{item.title}</h4>
          <span className="text-xs text-slate-500 shrink-0">{formatRelativeTime(item.createdAt)}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{item.message}</p>
        <div className="flex items-center justify-between mt-2">
          <div className={`w-max px-2 py-0.5 rounded-md text-xs font-medium ${visual.bgClass} ${visual.textClass}`}>
            {getNotificationTypeLabel(item.type)}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  )

  if (item.link) {
    return <Link href={item.link}>{content}</Link>
  }

  return content
}

export function MobileNotificationList({ notifications, totalCount }: MobileNotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="px-4 py-4 mb-20">
        <EmptyState
          icon={Bell}
          title="ไม่มีการแจ้งเตือน"
          description="คุณไม่มีรายการแจ้งเตือนในขณะนี้"
          size="compact"
        />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 mb-20">
      <div className="flex flex-col gap-3">
        {notifications.map((item) => (
          <MobileNotificationRow key={item.id} item={item} />
        ))}
      </div>

      {totalCount > notifications.length ? (
        <div className="flex justify-center mt-4">
          <p className="text-xs font-medium text-slate-500">
            แสดงล่าสุด {notifications.length} จาก {totalCount} รายการ
          </p>
        </div>
      ) : null}
    </div>
  )
}
