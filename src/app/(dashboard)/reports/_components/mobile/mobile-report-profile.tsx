import React from "react"
import type { ReportJobItem } from "@/lib/server/report-read-models"
import type { RiskTrendPoint } from "@/lib/server/risk-read-models"
import { DesktopCreateReport, type ReportFilterOption } from "../desktop-create-report"
import { MobileReportHeader } from "./mobile-report-header"
import { MobileSummaryCards } from "./mobile-summary-cards"
import { MobileTrendChart } from "./mobile-trend-chart"
import { MobileCategoryReports } from "./mobile-category-reports"
import { MobileDownloadReports } from "./mobile-download-reports"

type MobileMetrics = {
  totalStudents?: number
  highRiskStudents?: number
  watchStudents?: number
  openSupportCases?: number
  activePlans?: number
  openActionItems?: number
  averageAttendance30d?: number | null
}

export function MobileReportProfile({
  jobs,
  metrics,
  trendData,
  activeType,
  classrooms = [],
  semesters = [],
}: {
  jobs: ReportJobItem[]
  metrics?: MobileMetrics | null
  trendData?: RiskTrendPoint[] | null
  activeType?: string | null
  classrooms?: ReportFilterOption[]
  semesters?: ReportFilterOption[]
}) {
  return (
    <div className="bg-background min-h-screen relative pb-6">
      <MobileReportHeader />

      <div className="max-w-md mx-auto pt-2">
        <MobileSummaryCards metrics={metrics} />
        <MobileTrendChart trendData={trendData} />
        <MobileCategoryReports activeType={activeType} />
        <div className="px-4 mb-6">
          <DesktopCreateReport classrooms={classrooms} semesters={semesters} />
        </div>
        <MobileDownloadReports jobs={jobs} activeType={activeType} />
      </div>
    </div>
  )
}
