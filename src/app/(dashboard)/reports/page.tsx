import React from "react"

import { ErrorState } from "@/components/feedback"
import { PageHeader, PageShell } from "@/components/dashboard"
import { getReportJobs, getPopularReportTypes, type ReportJobItem } from "@/lib/server/report-read-models"
import { getStudentCareDashboard } from "@/lib/server/student-care-read-models"
import {
  getRiskFactorDistribution,
  getRiskTrendHistory,
  type RiskFactorDistribution,
  type RiskTrendPoint,
} from "@/lib/server/risk-read-models"
import { DesktopOverviewStats } from "./_components/desktop-overview-stats"
import { DesktopStatsCategory } from "./_components/desktop-stats-category"
import { DesktopTrendComparison } from "./_components/desktop-trend-comparison"
import { DesktopPopularReports } from "./_components/desktop-popular-reports"
import { DesktopLatestReports } from "./_components/desktop-latest-reports"
import { DesktopCreateReport } from "./_components/desktop-create-report"
import { DesktopInsights } from "./_components/desktop-insights"
import { ProcessReportButton } from "./_components/process-report-button"
import { MobileReportProfile } from "./_components/mobile/mobile-report-profile"

export default async function ReportsPage() {
  let jobs: ReportJobItem[] = []
  let popularTypes: Awaited<ReturnType<typeof getPopularReportTypes>> = []
  let loadError: string | null = null
  let dashboardMetrics: Awaited<ReturnType<typeof getStudentCareDashboard>>["metrics"] | null = null
  let factorDistribution: RiskFactorDistribution = { factors: [], totalStudents: 0 }
  let trendData: RiskTrendPoint[] = []

  try {
    const [jobsResult, popularResult, dashResult, factorResult, trendResult] = await Promise.all([
      getReportJobs(10),
      getPopularReportTypes(5),
      getStudentCareDashboard().catch(() => null),
      getRiskFactorDistribution().catch(() => ({ factors: [], totalStudents: 0 })),
      getRiskTrendHistory().catch(() => []),
    ])
    jobs = jobsResult
    popularTypes = popularResult
    dashboardMetrics = dashResult?.metrics ?? null
    factorDistribution = factorResult
    trendData = trendResult
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown report data error"
  }

  return (
    <div className="w-full overflow-x-hidden bg-background">
      
      {/* ---------------- MOBILE VIEW (< 1024px) ---------------- */}
      <div className="block lg:hidden">
        {loadError ? (
          <div className="px-4 pt-4">
            <ErrorState
              title="โหลดข้อมูลรายงานไม่ได้"
              description="ตรวจสอบสิทธิ์การเข้าถึงและตาราง report_jobs ใน Supabase"
              details={loadError}
            />
          </div>
        ) : null}
        <MobileReportProfile
          jobs={jobs}
          metrics={dashboardMetrics}
          trendData={trendData}
        />
      </div>

      {/* ---------------- DESKTOP VIEW (>= 1024px) ---------------- */}
      <div className="hidden lg:block">
        <PageShell size="wide" spacing="default">
          <PageHeader
            title="รายงานและการส่งออกข้อมูล"
            description="สร้างและดาวน์โหลดรายงานสรุปนักเรียน ความเสี่ยง การมาเรียน และผลการดูแลช่วยเหลือ"
            actions={<ProcessReportButton />}
          />

          {loadError ? (
            <div className="mb-6">
              <ErrorState
                title="โหลดข้อมูลรายงานไม่ได้"
                description="ตรวจสอบสิทธิ์การเข้าถึงและตาราง report_jobs ใน Supabase"
                details={loadError}
              />
            </div>
          ) : null}

          {/* 1. Overview Stats */}
          <DesktopOverviewStats metrics={dashboardMetrics} />

          {/* 2. Middle Row: Category, Trend, Popular */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 min-w-0">
              <DesktopStatsCategory factorDistribution={factorDistribution} />
            </div>
            <div className="lg:col-span-1 min-w-0">
              <DesktopTrendComparison trendData={trendData} />
            </div>
            <div className="lg:col-span-1 min-w-0">
              <DesktopPopularReports popularTypes={popularTypes} />
            </div>
          </div>

          {/* 3. Bottom Row: Latest, Create, Insights */}
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="xl:w-1/2 shrink-0 min-w-0">
              <DesktopLatestReports jobs={jobs} />
            </div>
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              <DesktopCreateReport />
              <DesktopInsights metrics={dashboardMetrics} />
            </div>
          </div>
        </PageShell>
      </div>
    </div>
  )
}
