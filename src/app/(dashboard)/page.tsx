import React from "react"
import { SummaryCards } from "./_components/summary-cards"
import { RiskCharts } from "./_components/risk-charts"
import { ActionItems } from "./_components/action-items"
import { TrackingTable } from "./_components/tracking-table"
import { RecentActivities } from "./_components/recent-activities"
import { BottomMiniCharts } from "./_components/bottom-mini-charts"
import { MobileDashboard } from "./_components/mobile-dashboard"
import { PageHeader, PageShell } from "@/components/dashboard"
import { ErrorState } from "@/components/feedback"
import {
  getStudentCareDashboard,
  type StudentCareDashboard,
} from "@/lib/server/student-care-read-models"
import { getUserRole } from "@/utils/supabase/server"

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
          <SummaryCards metrics={dashboard.metrics} />

          {/* Middle Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <RiskCharts />
            <ActionItems items={dashboard.actionQueue} />
          </div>

          {/* Bottom Section 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <TrackingTable students={dashboard.priorityStudents} />
            <RecentActivities />
          </div>

          {/* Bottom-most 3 cards */}
          <BottomMiniCharts />
        </PageShell>
      </div>
    </>
  )
}
