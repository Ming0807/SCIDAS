import React from "react"
import { MobileReportHeader } from "./mobile-report-header"
import { MobileSummaryCards } from "./mobile-summary-cards"
import { MobileTrendChart } from "./mobile-trend-chart"
import { MobileCategoryReports } from "./mobile-category-reports"
import { MobileDownloadReports } from "./mobile-download-reports"

export function MobileReportProfile() {
  return (
    <div className="bg-slate-50 min-h-screen relative pb-6">
      <MobileReportHeader />
      
      <div className="max-w-md mx-auto pt-2">
        <MobileSummaryCards />
        <MobileTrendChart />
        <MobileCategoryReports />
        <MobileDownloadReports />
      </div>

    </div>
  )
}
