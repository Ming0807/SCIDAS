import React from "react"
import Link from "next/link"

import { ErrorState } from "@/components/feedback"
import { getReportJobs, getPopularReportTypes, type ReportJobItem } from "@/lib/server/report-read-models"
import { getStudentCareDashboard } from "@/lib/server/student-care-read-models"
import { getUserProfile } from "@/lib/server/settings-read-models"
import { DesktopOverviewStats } from "./_components/desktop-overview-stats"
import { DesktopStatsCategory } from "./_components/desktop-stats-category"
import { DesktopTrendComparison } from "./_components/desktop-trend-comparison"
import { DesktopPopularReports } from "./_components/desktop-popular-reports"
import { DesktopLatestReports } from "./_components/desktop-latest-reports"
import { DesktopCreateReport } from "./_components/desktop-create-report"
import { DesktopInsights } from "./_components/desktop-insights"
import { MobileReportProfile } from "./_components/mobile/mobile-report-profile"
import { ChevronRight, Bell } from "lucide-react"

export default async function ReportsPage() {
  let jobs: ReportJobItem[] = []
  let popularTypes: Awaited<ReturnType<typeof getPopularReportTypes>> = []
  let loadError: string | null = null
  let profile: Awaited<ReturnType<typeof getUserProfile>> | null = null
  let dashboardMetrics: Awaited<ReturnType<typeof getStudentCareDashboard>>["metrics"] | null = null

  try {
    const [jobsResult, popularResult, profileResult, dashResult] = await Promise.all([
      getReportJobs(10),
      getPopularReportTypes(5),
      getUserProfile(),
      getStudentCareDashboard().catch(() => null),
    ])
    jobs = jobsResult
    popularTypes = popularResult
    profile = profileResult
    dashboardMetrics = dashResult?.metrics ?? null
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown report data error"
  }

  return (
    <div className="w-full bg-background min-h-screen">
      
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
        <MobileReportProfile jobs={jobs} metrics={dashboardMetrics} />
      </div>

      {/* ---------------- DESKTOP VIEW (>= 1024px) ---------------- */}
      <div className="hidden lg:block max-w-[1400px] mx-auto p-6 xl:p-8 pb-12">
        
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">รายงาน</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Link href="/" className="hover:text-primary transition-colors">หน้าหลัก</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-foreground">รายงาน</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
              <Bell className="w-5 h-5" />
            </Link>
            {profile ? (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border">
                <span className="w-9 h-9 rounded-full bg-primary/10 border border-border flex items-center justify-center text-sm font-bold text-primary">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">{profile.fullName}</span>
                  <span className="text-xs text-muted-foreground">{profile.roleLabel}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

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
            <DesktopStatsCategory />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <DesktopTrendComparison />
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

      </div>
    </div>
  )
}
