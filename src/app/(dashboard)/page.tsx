import React from "react"

import { SummaryCards } from "./_components/summary-cards"
import { RiskOverviewCard } from "./_components/risk-overview-card"
import { ActionItems } from "./_components/action-items"
import { TrackingTable } from "./_components/tracking-table"
import { DashboardClassroomFilter } from "./_components/dashboard-classroom-filter"
import { ExecutiveInsights } from "./_components/executive-insights"
import { MobileDashboard } from "./_components/mobile-dashboard"
import { QuickActionsRibbon } from "./_components/quick-actions-ribbon"
import { PageHeader, PageShell } from "@/components/dashboard"
import { ErrorState } from "@/components/feedback"
import {
  getExecutiveInsights,
  type ExecutiveInsights as ExecutiveInsightsData,
} from "@/lib/server/executive-read-models"
import {
  getStudentCareDashboard,
  type StudentCareDashboard,
} from "@/lib/server/student-care-read-models"

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = searchParams ? await searchParams : {}
  const rawClassroom = typeof params.classroom === "string" ? params.classroom : ""
  const rawSemester = typeof params.semester === "string" ? params.semester : ""
  const [dashboardResult, insights] = await Promise.all([
    getStudentCareDashboard()
      .then((data) => ({ data, error: null }))
      .catch((error: unknown) => ({
        data: emptyDashboard,
        error: error instanceof Error ? error.message : "Unknown dashboard data error",
      })),
    getExecutiveInsights({
      classroomId: rawClassroom || undefined,
      semesterId: rawSemester || undefined,
    }).catch(
      (): ExecutiveInsightsData => ({
        topAbsence: [],
        topLowGpa: [],
        gpaSemesterLabel: null,
        factors: [],
        factorsTotalStudents: 0,
        classrooms: [],
        classroomOptions: [],
        activeClassroomId: null,
        semesterOptions: [],
        activeSemesterId: null,
        trend: [],
      }),
    ),
  ])
  const dashboard = dashboardResult.data
  const activeClassroomId = insights.activeClassroomId
  const trackedStudents = activeClassroomId
    ? dashboard.priorityStudents.filter((s) => s.classroomId === activeClassroomId)
    : dashboard.priorityStudents
  const m = dashboard.metrics

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden block">
        <MobileDashboard
          dashboard={{ ...dashboard, priorityStudents: trackedStudents }}
          loadError={dashboardResult.error}
          topAbsence={insights.topAbsence}
          topLowGpa={insights.topLowGpa}
          classroomOptions={insights.classroomOptions}
          activeClassroomId={insights.activeClassroomId}
          semesterOptions={insights.semesterOptions}
          activeSemesterId={insights.activeSemesterId}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <PageShell size="wide" spacing="default" className="min-h-screen">
          <PageHeader
            title="ภาพรวมดูแลนักเรียน"
            description="ศูนย์บัญชาการติดตามความเสี่ยง งานดูแล และการช่วยเหลือนักเรียนรายบุคคล"
          />

          <QuickActionsRibbon />

          {dashboardResult.error ? (
            <ErrorState
              title="โหลดข้อมูล Dashboard ไม่ได้"
              description="ตรวจสอบว่า Supabase ใช้ migration 0008_ux_data_foundation.sql แล้ว และผู้ใช้มีสิทธิ์เข้าถึงโรงเรียนนี้"
              details={dashboardResult.error}
            />
          ) : null}

          {/* Top 4 Summary Metric Cards */}
          <SummaryCards metrics={m} />

          {/* Core Intelligence: Risk Distribution & Care Action Center */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            <RiskOverviewCard metrics={m} className="col-span-1 lg:col-span-7" />
            <ActionItems items={dashboard.actionQueue} className="col-span-1 lg:col-span-5" />
          </div>

          {/* Classroom/semester scope: filters the worklist table and insights below.
              Top summary cards always show the whole school. */}
          <DashboardClassroomFilter
            options={insights.classroomOptions}
            activeClassroomId={insights.activeClassroomId}
            semesterOptions={insights.semesterOptions}
            activeSemesterId={insights.activeSemesterId}
          />

          {/* Priority Worklist: Immediate Student Interventions */}
          <div className="w-full">
            <TrackingTable students={trackedStudents} />
          </div>

          {/* Executive Analytics: Top lists, factors, classrooms, trend */}
          <ExecutiveInsights insights={insights} />
        </PageShell>
      </div>
    </>
  )
}
