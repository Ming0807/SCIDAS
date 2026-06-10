import React from "react"
import { AlertTriangle, Heart, Plus, Smile, Users } from "lucide-react"

import { MetricCard, PageHeader, PageShell } from "@/components/dashboard"
import { Button } from "@/components/ui/button"

import { StudentFilters } from "./_components/student-filters"
import { StudentTable } from "./_components/student-table"
import { ClassSummary } from "./_components/class-summary"
import { StudentProfilePanel } from "./_components/student-profile-panel"
import { MobileStudents } from "./_components/mobile-students"
import { studentSummary } from "./_components/student-data"

export default function StudentsPage() {
  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="ข้อมูลนักเรียนและการจัดการ"
        description="จัดการข้อมูลนักเรียน บันทึก แก้ไข และติดตามข้อมูลรายบุคคล"
        actions={
          <Button>
            <Plus /> เพิ่มนักเรียน
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="นักเรียนทั้งหมด"
          value={studentSummary.total}
          description="ข้อมูลนักเรียนในระบบ"
          icon={Users}
          status="primary"
          size="compact"
        />
        <MetricCard
          title="ปกติ"
          value={studentSummary.normal}
          description="ไม่พบสัญญาณเสี่ยง"
          icon={Smile}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="ต้องติดตาม"
          value={studentSummary.watch}
          description="ควรดูแนวโน้มต่อเนื่อง"
          icon={AlertTriangle}
          status="watch"
          size="compact"
        />
        <MetricCard
          title="ติดตามพิเศษ"
          value={studentSummary.specialCare}
          description="ต้องมีผู้รับผิดชอบชัดเจน"
          icon={Heart}
          status="info"
          size="compact"
        />
      </div>

      <StudentFilters />

      <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="hidden min-h-[480px] md:block">
            <StudentTable />
          </div>
          <div className="md:hidden">
            <MobileStudents />
          </div>
          <ClassSummary />
        </div>

        <div className="min-w-0">
          <StudentProfilePanel />
        </div>
      </div>
    </PageShell>
  )
}
