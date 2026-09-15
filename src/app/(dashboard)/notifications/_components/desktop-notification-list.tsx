import React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, AlertCircle, TrendingDown, Calendar as CalendarIcon, MessageSquare, ClipboardList, Bell, Settings, BookOpen } from "lucide-react"
import type { NotificationItem, NotificationType, NotificationStatusFilter } from "@/lib/server/notification-read-models"
import { getNotificationTypeLabel, formatRelativeTime } from "@/lib/server/notification-read-models"
import { EmptyState } from "@/components/feedback"
import { cn } from "@/lib/utils"
import { NotificationReadToggle } from "./notification-read-toggle"
import { NotificationDeleteButton } from "./notification-delete-button"
import { buildNotificationHref } from "./notification-link-helpers"

export interface DesktopNotificationListProps {
  notifications: NotificationItem[]
  totalCount: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  currentStatus: NotificationStatusFilter
  currentType?: NotificationType
}

type NotificationVisual = {
  icon: React.ComponentType<{ className?: string }>
  bgClass: string
  textClass: string
  borderClass: string
}

const notificationVisuals: Record<NotificationType, NotificationVisual> = {
  risk_alert: {
    icon: AlertCircle,
    bgClass: "bg-red-50",
    textClass: "text-red-600",
    borderClass: "border-red-100",
  },
  attendance_alert: {
    icon: TrendingDown,
    bgClass: "bg-orange-50",
    textClass: "text-orange-500",
    borderClass: "border-orange-100",
  },
  assignment_alert: {
    icon: BookOpen,
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-500",
    borderClass: "border-indigo-100",
  },
  behavior_alert: {
    icon: MessageSquare,
    bgClass: "bg-green-50",
    textClass: "text-green-500",
    borderClass: "border-green-100",
  },
  home_visit_reminder: {
    icon: CalendarIcon,
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-600",
    borderClass: "border-emerald-100",
  },
  plan_review: {
    icon: ClipboardList,
    bgClass: "bg-purple-50",
    textClass: "text-purple-500",
    borderClass: "border-purple-100",
  },
  system: {
    icon: Settings,
    bgClass: "bg-slate-100",
    textClass: "text-slate-600",
    borderClass: "border-slate-100",
  },
  general: {
    icon: Bell,
    bgClass: "bg-blue-50",
    textClass: "text-blue-500",
    borderClass: "border-blue-100",
  },
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const visual = notificationVisuals[item.type] ?? notificationVisuals.general
  const Icon = visual.icon
  const hasLink = Boolean(item.link)

  const body = (
    <>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${visual.bgClass}`}>
        <Icon className={`w-5 h-5 ${visual.textClass}`} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-foreground truncate">{item.title}</h4>
          <span className="text-xs text-muted-foreground font-mono tabular-nums shrink-0 ml-2">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-2 truncate">{item.message}</p>
        <div className="flex items-center gap-2">
          <span className={`w-max px-2 py-0.5 rounded-md text-micro font-medium ${visual.bgClass} ${visual.textClass}`}>
            {getNotificationTypeLabel(item.type)}
          </span>
        </div>
      </div>
    </>
  )

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-2xl border transition-colors group",
        item.isRead ? "border-border/60 bg-muted/30" : `${visual.borderClass} bg-card shadow-xs`,
      )}
    >
      {hasLink && item.link ? (
        <Link href={item.link} className="flex min-w-0 flex-1 items-start gap-4 hover:bg-muted/50 rounded-xl p-1 -m-1 transition-colors">
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-4">{body}</div>
      )}
      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
        <NotificationReadToggle
          key={item.isRead ? "read" : "unread"}
          notificationId={item.id}
          isRead={item.isRead}
        />
        <NotificationDeleteButton notificationId={item.id} />
      </div>
    </div>
  )
}

export function DesktopNotificationList({
  notifications,
  totalCount,
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  currentStatus,
  currentType,
}: DesktopNotificationListProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h3 className="text-sm font-bold text-foreground font-mono tabular-nums">ทั้งหมด {totalCount} รายการ</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">จัดเรียงตาม</span>
          <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
            ล่าสุด
          </span>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Bell}
            title="ไม่มีการแจ้งเตือน"
            description="คุณไม่มีรายการแจ้งเตือนในขณะนี้"
            size="compact"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {notifications.map((item) => (
            <NotificationRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <div className="text-xs font-medium text-muted-foreground">
            หน้า {page} จาก {totalPages} ({totalCount} รายการ)
          </div>
          <div className="flex items-center gap-2">
            {hasPreviousPage ? (
              <Link
                href={buildNotificationHref({
                  status: currentStatus,
                  type: currentType,
                  page: page - 1,
                })}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                ก่อนหน้า
              </Link>
            ) : (
              <span className="flex items-center gap-1 rounded-lg border border-border/40 px-3 py-1.5 text-xs font-medium text-muted-foreground/40 cursor-not-allowed">
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
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                ถัดไป
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 rounded-lg border border-border/40 px-3 py-1.5 text-xs font-medium text-muted-foreground/40 cursor-not-allowed">
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
