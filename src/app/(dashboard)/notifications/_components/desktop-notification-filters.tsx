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
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">สถานะการอ่าน</h3>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href={buildNotificationHref({ status: "all", type: currentType })}
            className={`rounded-lg p-3 transition-colors ${
              currentStatus === "all" ? "ring-2 ring-indigo-400 bg-slate-50" : "bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <div className="text-xs text-slate-500">ทั้งหมด</div>
            <div className="mt-1 text-lg font-bold text-slate-800">{counts.total}</div>
          </Link>
          <Link
            href={buildNotificationHref({ status: "unread", type: currentType })}
            className={`rounded-lg p-3 transition-colors ${
              currentStatus === "unread" ? "ring-2 ring-indigo-400 bg-red-50" : "bg-red-50 hover:bg-red-100"
            }`}
          >
            <div className="text-xs text-red-600">ยังไม่ได้อ่าน</div>
            <div className="mt-1 text-lg font-bold text-red-700">{counts.unread}</div>
          </Link>
          <Link
            href={buildNotificationHref({ status: "read", type: currentType })}
            className={`rounded-lg p-3 transition-colors ${
              currentStatus === "read" ? "ring-2 ring-indigo-400 bg-green-50" : "bg-green-50 hover:bg-green-100"
            }`}
          >
            <div className="text-xs text-green-600">อ่านแล้ว</div>
            <div className="mt-1 text-lg font-bold text-green-700">{readCount}</div>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">ประเภทที่พบ</h3>
        {typeRows.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
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
                    isActive ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${typeDotClasses[type]}`} />
                    <span className="text-xs font-medium text-slate-700">
                      {getNotificationTypeLabel(type)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{count}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">ช่องทางการแจ้งเตือน</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-3">
              <Monitor className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">ในระบบ</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
              <CheckCircle2 className="h-3 w-3" />
              เปิด
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">อีเมล</span>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              ยังไม่เชื่อมต่อ
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">LINE Notify</span>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              ยังไม่เชื่อมต่อ
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
