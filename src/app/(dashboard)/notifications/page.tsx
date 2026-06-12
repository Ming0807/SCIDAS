import React from "react"
import Link from "next/link"
import { DesktopNotificationSidebar } from "./_components/desktop-notification-sidebar"
import { DesktopNotificationList } from "./_components/desktop-notification-list"
import { DesktopNotificationFilters } from "./_components/desktop-notification-filters"
import { MobileNotificationProfile } from "./_components/mobile/mobile-notification-profile"
import { ChevronRight, Bell } from "lucide-react"
import { ErrorState } from "@/components/feedback"
import { getNotifications, getNotificationCounts } from "@/lib/server/notification-read-models"
import type { NotificationStatusFilter, NotificationType } from "@/lib/server/notification-read-models"
import { markAllAsReadFormAction } from "@/app/actions/notifications.actions"

type SearchParams = Record<string, string | string[] | undefined>

type NotificationsPageProps = {
  searchParams?: Promise<SearchParams>
}

function getSearchParam(params: SearchParams, key: string): string {
  const value = params[key]
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0] ?? ""
  return ""
}

function resolveStatus(raw: string): NotificationStatusFilter {
  if (raw === "unread" || raw === "read") return raw
  return "all"
}

function resolveNotificationType(raw: string): NotificationType | undefined {
  const allowed: NotificationType[] = [
    "risk_alert",
    "attendance_alert",
    "assignment_alert",
    "behavior_alert",
    "home_visit_reminder",
    "plan_review",
    "system",
    "general",
  ]
  return allowed.includes(raw as NotificationType) ? (raw as NotificationType) : undefined
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = searchParams ? await searchParams : {}

  const status = resolveStatus(getSearchParam(params, "status"))
  const type = resolveNotificationType(getSearchParam(params, "type"))
  const page = Number.parseInt(getSearchParam(params, "page"), 10) || 1
  const limit = Number.parseInt(getSearchParam(params, "limit"), 10) || 20

  let notifications: Awaited<ReturnType<typeof getNotifications>>
  let counts: Awaited<ReturnType<typeof getNotificationCounts>>
  let loadError: string | null = null

  try {
    ;[notifications, counts] = await Promise.all([
      getNotifications({ status, type, page, limit }),
      getNotificationCounts(),
    ])
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load notifications"
  }

  if (loadError) {
    return (
      <div className="w-full bg-background min-h-screen">
        <div className="max-w-[1400px] mx-auto p-6 xl:p-8">
          <ErrorState
            title="ไม่สามารถโหลดการแจ้งเตือนได้"
            description={loadError}
            action={
              <a
                href="/notifications"
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                ลองใหม่
              </a>
            }
          />
        </div>
      </div>
    )
  }

  const safeNotifications = notifications!
  const safeCounts = counts!
  const markAllReadDisabled = safeCounts.unread === 0

  return (
    <div className="w-full bg-background min-h-screen">
      
      {/* ---------------- MOBILE VIEW (< 1024px) ---------------- */}
      <div className="block lg:hidden">
        <MobileNotificationProfile
          notifications={safeNotifications.items}
          counts={safeCounts}
          page={safeNotifications.page}
          totalPages={safeNotifications.totalPages}
          hasNextPage={safeNotifications.hasNextPage}
          hasPreviousPage={safeNotifications.hasPreviousPage}
          currentStatus={status}
          currentType={type}
        />
      </div>

      {/* ---------------- DESKTOP VIEW (>= 1024px) ---------------- */}
      <div className="hidden lg:block max-w-[1400px] mx-auto p-6 xl:p-8 pb-12">
        
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">การแจ้งเตือน</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                หน้าหลัก
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-bold text-slate-800">การแจ้งเตือน</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
              <span className="text-sm font-medium text-slate-700">ภาคเรียนที่ 1/2567</span>
            </div>
            
            <form action={markAllAsReadFormAction}>
              <button
                type="submit"
                disabled={markAllReadDisabled}
                className={
                  markAllReadDisabled
                    ? "cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500"
                    : "rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
                }
              >
                ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
              </button>
            </form>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            <div className="relative p-2 text-slate-400">
              <Bell className="w-5 h-5" />
              {safeCounts.unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
              )}
            </div>
            <div className="flex items-center gap-3 ml-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">การแจ้งเตือน</span>
                <span className="text-xs text-slate-500">{safeCounts.total} รายการ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left Column (Sidebar) */}
          <div className="xl:w-[280px] shrink-0 min-w-0">
            <DesktopNotificationSidebar
              counts={safeCounts}
              currentStatus={status}
              currentType={type}
            />
          </div>

          {/* Middle Column (List) */}
          <div className="flex-1 min-w-0">
            <DesktopNotificationList
              notifications={safeNotifications.items}
              totalCount={safeNotifications.totalCount}
              page={safeNotifications.page}
              totalPages={safeNotifications.totalPages}
              hasNextPage={safeNotifications.hasNextPage}
              hasPreviousPage={safeNotifications.hasPreviousPage}
              currentStatus={status}
              currentType={type}
            />
          </div>

          {/* Right Column (Filters) */}
          <div className="xl:w-[320px] shrink-0 min-w-0">
            <DesktopNotificationFilters
              counts={safeCounts}
              currentStatus={status}
              currentType={type}
            />
          </div>

        </div>

      </div>
    </div>
  )
}
