import React from "react"

import { ErrorState } from "@/components/feedback"
import { getReportJobs, type ReportJobItem } from "@/lib/server/report-read-models"
import { DesktopOverviewStats } from "./_components/desktop-overview-stats"
import { DesktopStatsCategory } from "./_components/desktop-stats-category"
import { DesktopTrendComparison } from "./_components/desktop-trend-comparison"
import { DesktopPopularReports } from "./_components/desktop-popular-reports"
import { DesktopLatestReports } from "./_components/desktop-latest-reports"
import { DesktopCreateReport } from "./_components/desktop-create-report"
import { DesktopInsights } from "./_components/desktop-insights"
import { MobileReportProfile } from "./_components/mobile/mobile-report-profile"
import { ChevronRight, Filter, Bell } from "lucide-react"

export default async function ReportsPage() {
  let jobs: ReportJobItem[] = []
  let loadError: string | null = null

  try {
    jobs = await getReportJobs(10)
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
        <MobileReportProfile jobs={jobs} />
      </div>

      {/* ---------------- DESKTOP VIEW (>= 1024px) ---------------- */}
      <div className="hidden lg:block max-w-[1400px] mx-auto p-6 xl:p-8 pb-12">
        
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">รายงาน</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span className="cursor-pointer hover:text-indigo-600 transition-colors">หน้าหลัก</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-slate-800">รายงาน</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-xs font-medium text-slate-700">ภาคเรียนที่ 1/2567</span>
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              ตัวกรอง
            </button>
            <div className="w-px h-8 bg-slate-200"></div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 ml-2">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher" alt="Teacher" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">นางสาวจันทร์จิรา พรดี</span>
                <span className="text-xs text-slate-500">ครูที่ปรึกษา</span>
              </div>
            </div>
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
        <DesktopOverviewStats />

        {/* 2. Middle Row: Category, Trend, Popular */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 min-w-0">
            <DesktopStatsCategory />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <DesktopTrendComparison />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <DesktopPopularReports />
          </div>
        </div>

        {/* 3. Bottom Row: Latest, Create, Insights */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="xl:w-1/2 shrink-0 min-w-0">
            <DesktopLatestReports jobs={jobs} />
          </div>
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <DesktopCreateReport />
            <DesktopInsights />
          </div>
        </div>

      </div>
    </div>
  )
}
