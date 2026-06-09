import React from "react"
import { AttendanceFilters } from "./_components/attendance-filters"
import { AttendanceSummary } from "./_components/attendance-summary"
import { AttendanceCharts } from "./_components/attendance-charts"
import { AbsentReasons } from "./_components/absent-reasons"
import { AttendanceTable } from "./_components/attendance-table"
import { ClassSummary } from "./_components/class-summary"
import { QuickTools } from "./_components/quick-tools"
import { GradeLevelSummary } from "./_components/grade-level-summary"
import { MobileAttendance } from "./_components/mobile-attendance"

export default function AttendancePage() {
  return (
    <>
      {/* Mobile PWA View */}
      <div className="md:hidden block">
        <MobileAttendance />
      </div>

      {/* Desktop Responsive View */}
      <div className="hidden md:flex p-4 sm:p-6 lg:p-8 bg-[#f8fafc] min-h-[calc(100vh-64px)] flex-col">
        
        {/* Page Header */}
        <div className="mb-6 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">การมาเรียน</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">ติดตามการมาเรียน ขาด ลา มาสาย และสรุปสถิติการเข้าเรียนของนักเรียน</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          
          <AttendanceFilters />
          <AttendanceSummary />

          {/* Main Grid: Charts and Reasons */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2">
              <AttendanceCharts />
            </div>
            <div className="xl:col-span-1">
              <AbsentReasons />
            </div>
          </div>

          {/* Master-Detail Layout for Table and Sidebars */}
          <div className="flex flex-col xl:flex-row gap-6 mb-6">
            <div className="xl:flex-[2] flex flex-col gap-6 min-w-0">
              <AttendanceTable />
            </div>
            
            <div className="xl:flex-[1] flex flex-col gap-6 min-w-0">
              <ClassSummary />
              <QuickTools />
            </div>
          </div>

          {/* Bottom Summary */}
          <GradeLevelSummary />

        </div>

      </div>
    </>
  )
}
