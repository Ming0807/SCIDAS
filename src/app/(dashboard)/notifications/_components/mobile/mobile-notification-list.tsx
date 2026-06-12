import React from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft, Bell, AlertCircle, TrendingDown, BookOpen, MessageSquare, CalendarIcon, ClipboardList, Settings } from "lucide-react"
import type { NotificationItem, NotificationType, NotificationStatusFilter } from "@/lib/server/notification-read-models"
import { getNotificationTypeLabel, formatRelativeTime } from "@/lib/server/notification-read-models"
import { EmptyState } from "@/components/feedback"
import { cn } from "@/lib/utils"
import { NotificationReadToggle } from "../notification-read-toggle"
import { buildNotificationHref } from "../notification-link-helpers"

export interface MobileNotificationListProps {
  notifications: NotificationItem[]
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  currentStatus: NotificationStatusFilter
  currentType?: NotificationType
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

  const body = (
    <>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ml-2 ${visual.bgClass} border-current/10`}>
        <Icon className={`w-5 h-5 ${visual.textClass}`} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
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
    </>
  )

  return (
    <div
      className={cn(
        "rounded-xl p-4 border border-slate-200 shadow-sm flex gap-3 relative",
        item.isRead ? "bg-slate-50" : "bg-white",
      )}
    >
      <div className="absolute top-4 right-3">
        <NotificationReadToggle
          key={item.isRead ? "read" : "unread"}
          notificationId={item.id}
          isRead={item.isRead}
        />
      </div>
      {hasLink && item.link ? (
        <Link href={item.link} className="flex min-w-0 flex-1 gap-3 pr-8">
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 gap-3 pr-8">{body}</div>
      )}
    </div>
  )
}

export function MobileNotificationList({
  notifications,
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  currentStatus,
  currentType,
}: MobileNotificationListProps) {
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

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs font-medium text-slate-500">
            หน้า {page} จาก {totalPages}
          </div>
          <div className="flex items-center gap-2">
            {hasPreviousPage ? (
              <Link
                href={buildNotificationHref({
                  status: currentStatus,
                  type: currentType,
                  page: page - 1,
                })}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                ก่อนหน้า
              </Link>
            ) : (
              <span className="flex items-center gap-1 rounded-lg border border-slate-100 px-3 py-1.5 text-xs font-medium text-slate-300">
                <ChevronLeft className="h-3.5 w-3.5" />
                ก่อนหน้า
              </span>
            )}

            {hasNextPage ? (
              <Link
                href={buildNotificationHref({
                  status: currentStatus,
                  type: currentType,
                  page: page + 1,
                })}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                ถัดไป
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 rounded-lg border border-slate-100 px-3 py-1.5 text-xs font-medium text-slate-300">
                ถัดไป
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
