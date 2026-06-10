import React from "react"
import { Calendar, Download, Filter, Search } from "lucide-react"

import { PageHeader, PageShell } from "@/components/dashboard"
import { FilterBar } from "@/components/data"
import { Button } from "@/components/ui/button"

import { AcademicSummaryCards } from "./_components/academic-summary-cards"
import { AcademicCharts } from "./_components/academic-charts"
import { AtRiskStudentsList, TopStudentsList } from "./_components/student-lists"
import { ClassroomComparison } from "./_components/classroom-comparison"
import { StudentAcademicTable } from "./_components/student-academic-table"
import { BottomInsights } from "./_components/bottom-insights"
import { MobileAcademicProfile } from "./_components/mobile-academic-profile"

export default function AcademicsPage() {
  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="ผลการเรียน"
        description="ภาพรวมผลสัมฤทธิ์ทางการเรียน ปีการศึกษา 2567"
        actions={
          <Button variant="outline">
            <Download /> ส่งออกรายงาน
          </Button>
        }
      />

      <FilterBar
        title="ค้นหาและกรองผลการเรียน"
        search={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหานักเรียน, ห้องเรียน, รายวิชา..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>
        }
        filters={
          <>
            <Button variant="outline">
              <Calendar /> ภาคเรียนที่ 1/2567
            </Button>
            <Button variant="outline">
              <Filter /> ตัวกรอง
            </Button>
          </>
        }
      />

      <AcademicSummaryCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 2xl:grid-cols-4">
        <div className="xl:col-span-2 2xl:col-span-3">
          <AcademicCharts />
        </div>
        <AtRiskStudentsList />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 2xl:grid-cols-4">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2 2xl:col-span-3">
          <ClassroomComparison />
          <div className="hidden md:block">
            <StudentAcademicTable />
          </div>
          <div className="md:hidden">
            <MobileAcademicProfile />
          </div>
        </div>
        <TopStudentsList />
      </div>

      <BottomInsights />
    </PageShell>
  )
}
