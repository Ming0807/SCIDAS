import React from "react"
import { MobileAttendanceHeader } from "./mobile/mobile-attendance-header"
import { MobileAttendanceOverview } from "./mobile/mobile-attendance-overview"
import { MobileAttendanceTrend } from "./mobile/mobile-attendance-trend"
import { MobileAttendanceStats } from "./mobile/mobile-attendance-stats"
import { MobileAttendanceRecent } from "./mobile/mobile-attendance-recent"
import { MobileAttendanceAtRisk } from "./mobile/mobile-attendance-at-risk"

export function MobileAttendance() {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-20 max-w-md mx-auto">
      <MobileAttendanceHeader />
      <MobileAttendanceOverview />
      <MobileAttendanceTrend />
      <MobileAttendanceStats />
      <MobileAttendanceRecent />
      <MobileAttendanceAtRisk />
    </div>
  )
}
