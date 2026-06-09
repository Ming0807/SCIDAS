import React from "react"
import { SummaryCards } from "./_components/summary-cards"
import { RiskCharts } from "./_components/risk-charts"
import { ActionItems } from "./_components/action-items"
import { TrackingTable } from "./_components/tracking-table"
import { RecentActivities } from "./_components/recent-activities"
import { BottomMiniCharts } from "./_components/bottom-mini-charts"
import { MobileDashboard } from "./_components/mobile-dashboard"

export default function DashboardPage() {
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden block">
        <MobileDashboard />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block p-8 space-y-6 bg-[#f8fafc] min-h-screen">
        {/* Top 4 Summary Cards */}
        <SummaryCards />

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <RiskCharts />
          <ActionItems />
        </div>

        {/* Bottom Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <TrackingTable />
          <RecentActivities />
        </div>

        {/* Bottom-most 3 cards */}
        <BottomMiniCharts />
      </div>
    </>
  )
}
