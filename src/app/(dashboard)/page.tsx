import React from "react"
import { BookOpen, CalendarCheck, Clock, Users } from "lucide-react"

import { SummaryCards } from "./_components/summary-cards"
import { ActionItems } from "./_components/action-items"
import { TrackingTable } from "./_components/tracking-table"
import { MobileDashboard } from "./_components/mobile-dashboard"
import { PageHeader, PageShell, StatusBadge } from "@/components/dashboard"
import { ErrorState } from "@/components/feedback"
import {
  getStudentCareDashboard,
  type StudentCareDashboard,
} from "@/lib/server/student-care-read-models"
import { getUserRole } from "@/utils/supabase/server"
import { formatPercent, formatThaiShortDate } from "@/lib/student-care-formatters"
import { cn } from "@/lib/utils"

const emptyDashboard: StudentCareDashboard = {
  currentSemesterId: null,
  metrics: {
    totalStudents: 0,
    highRiskStudents: 0,
    watchStudents: 0,
    openSupportCases: 0,
    activePlans: 0,
    openActionItems: 0,
    averageAttendance30d: null,
  },
  priorityStudents: [],
  actionQueue: [],
}

export default async function DashboardPage() {
  const [role, dashboardResult] = await Promise.all([
    getUserRole(),
    getStudentCareDashboard()
      .then((data) => ({ data, error: null }))
      .catch((error: unknown) => ({
        data: emptyDashboard,
        error: error instanceof Error ? error.message : "Unknown dashboard data error",
      })),
  ])
  const dashboard = dashboardResult.data
  const m = dashboard.metrics

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden block">
        <MobileDashboard
          role={role}
          dashboard={dashboard}
          loadError={dashboardResult.error}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <PageShell size="wide" spacing="default" className="min-h-screen">
          <PageHeader
            title="ภาพรวมดูแลนักเรียน"
            description="ติดตามความเสี่ยง งานดูแล และนักเรียนที่ควรได้รับการช่วยเหลือก่อน"
          />

          {dashboardResult.error ? (
            <ErrorState
              title="โหลดข้อมูล Dashboard ไม่ได้"
              description="ตรวจสอบว่า Supabase ใช้ migration 0008_ux_data_foundation.sql แล้ว และผู้ใช้มีสิทธิ์เข้าถึงโรงเรียนนี้"
              details={dashboardResult.error}
            />
          ) : null}

          {/* Top 4 Summary Cards */}
          <SummaryCards metrics={m} />

          {/* Middle: Risk breakdown + Action Items */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Risk breakdown */}
            <div className="col-span-1 lg:col-span-6 bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                ภาพรวมความเสี่ยง
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-2xl font-bold text-emerald-700">
                    {m.totalStudents - m.highRiskStudents - m.watchStudents}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">ปกติ</div>
                  <div className="text-xs text-emerald-500">
                    {m.totalStudents > 0
                      ? formatPercent(
                          ((m.totalStudents - m.highRiskStudents - m.watchStudents) /
                            m.totalStudents) *
                            100,
                        )
                      : "-"}
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-2xl font-bold text-amber-700">
                    {m.watchStudents}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">เฝ้าระวัง</div>
                  <div className="text-xs text-amber-500">
                    {m.totalStudents > 0
                      ? formatPercent((m.watchStudents / m.totalStudents) * 100)
                      : "-"}
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100">
                  <div className="text-2xl font-bold text-red-700">
                    {m.highRiskStudents}
                  </div>
                  <div className="text-xs text-red-600 mt-1">เสี่ยงสูง</div>
                  <div className="text-xs text-red-500">
                    {m.totalStudents > 0
                      ? formatPercent((m.highRiskStudents / m.totalStudents) * 100)
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            <ActionItems items={dashboard.actionQueue} />
          </div>

          {/* Bottom: Tracking + Recent Activities */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <TrackingTable students={dashboard.priorityStudents} />

            {/* Recent Activities — from action queue */}
            <div className="col-span-1 lg:col-span-5 bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  งานที่ต้องทำล่าสุด
                </h3>
              </div>
              {dashboard.actionQueue.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  ไม่มีงานที่ต้องทำ
                </p>
              ) : (
                <div className="flex-1 flex flex-col gap-3">
                  {dashboard.actionQueue.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                          item.priority === "high"
                            ? "bg-red-50 text-red-600"
                            : item.priority === "medium"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.title ?? item.description ?? "งาน"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.studentName}
                          {item.dueDate ? ` · กำหนด ${formatThaiShortDate(item.dueDate)}` : ""}
                        </span>
                      </div>
                      <StatusBadge
                        status={
                          item.status === "todo"
                            ? "neutral"
                            : item.status === "in_progress"
                              ? "info"
                              : "success"
                        }
                        label={
                          item.status === "todo"
                            ? "ต้องทำ"
                            : item.status === "in_progress"
                              ? "กำลังทำ"
                              : "เสร็จ"
                        }
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Mini Charts — real metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarCheck className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-foreground">
                  การมาเรียน 30 วัน
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">
                    อัตราการมาเรียน
                  </div>
                  <span className="text-2xl font-bold text-foreground">
                    {m.averageAttendance30d != null
                      ? formatPercent(m.averageAttendance30d)
                      : "-"}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CalendarCheck className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Support Cases */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-foreground">
                  การช่วยเหลือ
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">เปิดอยู่</span>
                  <span className="font-semibold text-foreground">
                    {m.openSupportCases}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">แผนกำลังดำเนินการ</span>
                  <span className="font-semibold text-foreground">
                    {m.activePlans}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">งานที่ต้องทำ</span>
                  <span className="font-semibold text-foreground">
                    {m.openActionItems}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Count */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-foreground">
                  ข้อมูลนักเรียน
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">
                    นักเรียนทั้งหมด
                  </div>
                  <span className="text-2xl font-bold text-foreground">
                    {m.totalStudents.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">คน</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex gap-3 mt-3 text-xs">
                <StatusBadge status="watch" label={`เฝ้าระวัง ${m.watchStudents}`} size="sm" />
                <StatusBadge status="high-risk" label={`เสี่ยงสูง ${m.highRiskStudents}`} size="sm" />
              </div>
            </div>
          </div>
        </PageShell>
      </div>
    </>
  )
}
