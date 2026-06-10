import { AlertTriangle, BookOpen, GraduationCap, Users } from "lucide-react"

import { MetricCard } from "@/components/dashboard"

import { academicSummary } from "./academic-data"

export function AcademicSummaryCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="เกรดเฉลี่ยรวม"
        value={academicSummary.averageGpa.toFixed(2)}
        description={`จากภาคเรียนที่แล้ว ${academicSummary.previousGpa.toFixed(2)}`}
        delta={{
          value: "+0.26",
          label: "GPA",
          trend: "up",
          tone: "success",
        }}
        icon={GraduationCap}
        status="primary"
        statusLabel="ภาคเรียนที่ 1/2567"
        size="compact"
      />
      <MetricCard
        title="ผลการเรียนดี"
        value={academicSummary.goodStudents}
        description="18.4% ของนักเรียนทั้งหมด"
        icon={Users}
        status="success"
        size="compact"
      />
      <MetricCard
        title="ต้องติดตามใกล้ชิด"
        value={academicSummary.watchStudents}
        description="ควรวางแผนช่วยเหลือรายบุคคล"
        icon={AlertTriangle}
        status="high-risk"
        size="compact"
      />
      <MetricCard
        title="วิชาเฉลี่ยสูงสุด"
        value={academicSummary.topSubject}
        description={`ค่าเฉลี่ย ${academicSummary.topSubjectAverage.toFixed(2)}`}
        icon={BookOpen}
        status="info"
        size="compact"
      />
    </div>
  )
}
