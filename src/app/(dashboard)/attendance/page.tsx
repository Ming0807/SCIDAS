import React from "react"
import { Plus } from "lucide-react"

import { PageHeader, PageShell } from "@/components/dashboard"
import { Button } from "@/components/ui/button"

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
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="การมาเรียน"
        description="ติดตามการมาเรียน ขาด ลา มาสาย และสรุปสถิติการเข้าเรียนของนักเรียน"
        actions={
          <Button>
            <Plus /> บันทึกการมาเรียน
          </Button>
        }
      />

      <AttendanceFilters />
      <AttendanceSummary />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AttendanceCharts />
        </div>
        <AbsentReasons />
      </div>

      <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="min-w-0">
          <div className="hidden md:block">
            <AttendanceTable />
          </div>
          <div className="md:hidden">
            <MobileAttendance />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <ClassSummary />
          <QuickTools />
        </div>
      </div>

      <GradeLevelSummary />
    </PageShell>
  )
}
