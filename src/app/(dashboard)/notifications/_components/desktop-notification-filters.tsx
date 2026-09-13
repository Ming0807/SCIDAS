import React from "react"
import Link from "next/link"
import { Bell, CheckCircle2, Mail, MessageCircle, Monitor } from "lucide-react"

import type { NotificationCounts, NotificationType, NotificationStatusFilter } from "@/lib/server/notification-read-models"
import { getNotificationTypeLabel } from "@/lib/server/notification-read-models"
import { buildNotificationHref } from "./notification-link-helpers"

export interface DesktopNotificationFiltersProps {
  counts: NotificationCounts
  currentStatus: NotificationStatusFilter
  currentType?: NotificationType
}

const typeDotClasses: Record<NotificationType, string> = {
  risk_alert: "bg-red-500",
  attendance_alert: "bg-orange-500",
  assignment_alert: "bg-indigo-500",
  behavior_alert: "bg-green-500",
  home_visit_reminder: "bg-emerald-500",
  plan_review: "bg-purple-500",
  system: "bg-slate-500",
  general: "bg-blue-500",
}

export function DesktopNotificationFilters({ counts, currentStatus, currentType }: DesktopNotificationFiltersProps) {
  const readCount = Math.max(counts.total - counts.unread, 0)
  const typeRows = (Object.entries(counts.byType) as [NotificationType, number][])
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">สถานะการอ่าน</h3>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href={buildNotificationHref({ status: "all", type: currentType })}
            className={`rounded-lg p-3 transition-colors ${
              currentStatus === "all" ? "ring-2 ring-primary/40 bg-muted" : "bg-muted/50 hover:bg-muted"
            }`}
          >
            <div className="text-xs text-muted-foreground">ทั้งหมด</div>
            <div className="mt-1 text-lg font-bold text-foreground">{counts.total}</div>
          </Link>
          <Link
            href={buildNotificationHref({ status: "unread", type: currentType })}
            className={`rounded-lg p-3 transition-colors ${
              currentStatus === "unread" ? "ring-2 ring-destructive/40 bg-destructive/10" : "bg-destructive/5 hover:bg-destructive/10"
            }`}
          >
            <div className="text-xs text-destructive">ยังไม่ได้อ่าน</div>
            <div className="mt-1 text-lg font-bold text-destructive">{counts.unread}</div>
          </Link>
          <Link
            href={buildNotificationHref({ status: "read", type: currentType })}
            className={`rounded-lg p-3 transition-colors ${
              currentStatus === "read" ? "ring-2 ring-emerald-500/40 bg-emerald-500/10" : "bg-emerald-500/5 hover:bg-emerald-500/10"
            }`}
          >
            <div className="text-xs text-emerald-600 dark:text-emerald-400">อ่านแล้ว</div>
            <div className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">{readCount}</div>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">ประเภทที่พบ</h3>
        {typeRows.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <Bell className="h-4 w-4" />
            ยังไม่มีข้อมูลประเภทการแจ้งเตือน
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {typeRows.map(([type, count]) => {
              const isActive = currentType === type
              return (
                <Link
                  key={type}
                  href={buildNotificationHref({ status: currentStatus, type })}
                  className={`flex items-center justify-between rounded-lg p-2 transition-colors ${
                    isActive ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${typeDotClasses[type]}`} />
                    <span className="text-xs">
                      {getNotificationTypeLabel(type)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold">{count}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">ช่องทางการแจ้งเตือน</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-3">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">ในระบบ</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              เปิด
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">อีเมล</span>
            </div>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              ยังไม่เชื่อมต่อ
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">LINE Notify</span>
            </div>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              ยังไม่เชื่อมต่อ
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
